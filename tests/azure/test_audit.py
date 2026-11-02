"""Synthetic Azure CLI tests. No credentials, network or real cloud resources."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / 'skills/optimice-azure/scripts/audit.py'
SUBSCRIPTION = '00000000-0000-0000-0000-000000000001'
FAKE = r'''#!/usr/bin/env python3
import json,os,sys
from datetime import datetime,timedelta,timezone
args=sys.argv[1:];sub='00000000-0000-0000-0000-000000000001';mode=os.environ.get('FAKE_MODE','normal')
with open(os.environ['CALL_LOG'],'a') as log:log.write(json.dumps(args)+'\n')
if mode=='error':
 sys.stderr.write('synthetic-sensitive-marker');sys.exit(1)
if args[:2]==['account','show']:
 data={'name':'Synthetic subscription','environmentName':'AzureCloud','id':sub if mode!='mismatch' else '00000000-0000-0000-0000-000000000002'}
elif args[:2]==['vm','list']:
 scope=sub if mode!='foreign' else '00000000-0000-0000-0000-000000000002'
 data=[{'id':f'/subscriptions/{scope}/resourceGroups/test/providers/Microsoft.Compute/virtualMachines/test-vm','name':'test-vm','hardwareProfile':{'vmSize':'Standard_B2s'},'location':'westeurope','resourceGroup':'test'}]
elif args[:2]==['disk','list']:
 data=[{'name':'shared-disk','diskState':'Unattached','managedByExtended':['/subscriptions/'+sub+'/vm/test'],'diskSizeGb':8}]
elif args[:3]==['network','public-ip','list']:
 data=[{'name':'nat-ip','natGateway':{'id':'synthetic-nat'}}]
elif args[:3]==['monitor','metrics','list']:
 days=2 if mode=='sparse' else 30
 today=datetime.now(timezone.utc).replace(hour=0,minute=0,second=0,microsecond=0)
 data={'value':[{'timeseries':[{'data':[{'timeStamp':(today-timedelta(days=n+1)).isoformat(),'average':5,'maximum':95} for n in range(days)]}]}]}
elif args and args[0]=='rest':
 data={'properties':{'columns':[{'name':'PreTaxCost' if mode!='columns' else 'Other','type':'Number'},{'name':'ServiceName','type':'String'},{'name':'Currency','type':'String'}],'rows':[[12.5,'Virtual Machines','EUR']],'nextLink':'https://example.invalid/do-not-follow' if mode=='pagination' else None}}
else:data=[]
print(json.dumps(data))
'''


class AzureAuditTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.bin = self.base / 'bin'
        self.bin.mkdir()
        (self.bin / 'az').write_text(FAKE)
        (self.bin / 'az').chmod(0o700)
        self.log = self.base / 'calls'
        self.env = {**os.environ, 'PATH': str(self.bin) + ':' + os.environ['PATH'], 'CALL_LOG': str(self.log)}

    def tearDown(self):
        self.temp.cleanup()

    def run_audit(self, *args, mode='normal'):
        return subprocess.run(['python3', str(SCRIPT), '--subscription', SUBSCRIPTION, *args],
                              env={**self.env, 'FAKE_MODE': mode}, capture_output=True, text=True, timeout=15)

    def report(self):
        return json.loads((self.base / 'report/audit.json').read_text())

    def execute(self, *args, mode='normal'):
        return self.run_audit('--execute', '--out', str(self.base / 'report'), *args, mode=mode)

    def calls(self):
        return [json.loads(line) for line in self.log.read_text().splitlines()]

    def test_plan_is_local_and_does_not_create_reports(self):
        result = self.run_audit('--out', str(self.base / 'report'))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(self.log.exists())
        self.assertFalse((self.base / 'report').exists())
        self.assertIn('Microsoft.CostManagement/query', result.stdout)

    def test_invalid_subscription_never_reaches_cli(self):
        result = self.run_audit('--subscription=not-a-guid')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.log.exists())

    def test_identity_mismatch_stops_after_account_read(self):
        result = self.execute(mode='mismatch')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(self.calls()), 1)
        self.assertTrue(self.report()['data_gaps'])

    def test_only_scoped_reads_and_one_fixed_cost_query(self):
        result = self.execute()
        self.assertEqual(result.returncode, 0, result.stderr)
        rest = []
        for command in self.calls():
            self.assertIn('--subscription', command)
            self.assertEqual(command[command.index('--subscription') + 1], SUBSCRIPTION)
            self.assertNotIn('--refresh', command)
            if command[0] == 'rest':
                rest.append(command)
                self.assertEqual(command[command.index('--method') + 1], 'post')
                self.assertEqual(command[command.index('--url') + 1], f'https://management.azure.com/subscriptions/{SUBSCRIPTION}/providers/Microsoft.CostManagement/query?api-version=2026-06-01')
                body = json.loads(command[command.index('--body') + 1])
                self.assertEqual(body['type'], 'ActualCost')
                self.assertTrue(body['timePeriod']['to'].endswith('23:59:59Z'))
            else:
                self.assertTrue('list' in command or command[:2] == ['account', 'show'])
        self.assertEqual(len(rest), 1)
        cpu = next(f for f in self.report()['findings'] if f['category'] == 'Posible VM sobredimensionada')
        self.assertIn('95', cpu['evidence'])
        self.assertEqual((self.base / 'report').stat().st_mode & 0o777, 0o700)
        self.assertEqual((self.base / 'report/audit.json').stat().st_mode & 0o777, 0o600)

    def test_cross_subscription_metric_ids_are_not_followed(self):
        result = self.execute(mode='foreign')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(any(command[:3] == ['monitor', 'metrics', 'list'] for command in self.calls()))
        self.assertTrue(any('ámbito' in gap for gap in self.report()['data_gaps']))

    def test_sparse_metrics_do_not_infer_underutilization(self):
        result = self.execute(mode='sparse')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(any(f['category'] == 'Posible VM sobredimensionada' for f in self.report()['findings']))
        self.assertTrue(any('cobertura' in gap for gap in self.report()['data_gaps']))

    def test_shared_disk_and_nat_address_are_not_orphans(self):
        result = self.execute()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(any(f['category'] in ['Disco sin adjuntar', 'IP pública sin binding'] for f in self.report()['findings']))

    def test_cost_pagination_is_reported_not_followed(self):
        result = self.execute(mode='pagination')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(any('paginación' in gap for gap in self.report()['data_gaps']))
        self.assertEqual(sum(command[0] == 'rest' for command in self.calls()), 1)

    def test_unknown_cost_columns_are_not_reported_as_valid_costs(self):
        result = self.execute(mode='columns')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(any('columnas' in gap for gap in self.report()['data_gaps']))
        self.assertNotIn('Cost Management por servicio', self.report()['summary'])

    def test_amortized_cost_is_explicit(self):
        result = self.execute('--cost-type', 'AmortizedCost')
        self.assertEqual(result.returncode, 0, result.stderr)
        command = next(c for c in self.calls() if c[0] == 'rest')
        self.assertEqual(json.loads(command[command.index('--body') + 1])['type'], 'AmortizedCost')
        self.assertEqual(self.report()['scope']['cost_type'], 'AmortizedCost')

    def test_existing_output_and_symlink_are_not_overwritten(self):
        out = self.base / 'report'
        out.mkdir()
        victim = self.base / 'victim'
        victim.write_text('preserve me')
        (out / 'audit.json').symlink_to(victim)
        result = self.execute()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(victim.read_text(), 'preserve me')
        self.assertFalse(self.log.exists())

    def test_cli_errors_do_not_expose_raw_stderr(self):
        result = self.execute(mode='error')
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('synthetic-sensitive-marker', (self.base / 'report/audit.json').read_text())


if __name__ == '__main__':
    unittest.main()
