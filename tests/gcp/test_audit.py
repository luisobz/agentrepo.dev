"""Synthetic tests, designed to run in a no-network container without cloud credentials."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / 'skills/optimice-gcp/scripts/audit.py'
FAKE = '''#!/usr/bin/env python3
import json,os,sys
from pathlib import Path
with open(os.environ['CALL_LOG'],'a') as log:log.write(json.dumps(sys.argv[1:])+'\\n')
a=sys.argv[1:]
if a[:2]==['projects','describe']:data={'projectId':'test-project','lifecycleState':'ACTIVE'}
elif a[:3]==['compute','instances','list']:data=[{'name':'test-vm','id':'123','zone':'zones/test-zone','machineType':'types/e2-medium','status':'RUNNING'}]
elif a[:3]==['compute','disks','list']:data=[{'name':'disk','status':'READY','sizeGb':10}]
elif a[:3]==['compute','addresses','list']:data=[{'name':'ip','status':'RESERVED'}]
else:data=[]
print(json.dumps(data))
'''


class AuditTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.bin = self.base / 'bin'
        self.bin.mkdir()
        (self.bin / 'gcloud').write_text(FAKE)
        (self.bin / 'gcloud').chmod(0o700)
        self.log = self.base / 'calls'
        self.env = {**os.environ, 'PATH': str(self.bin) + ':' + os.environ['PATH'], 'CALL_LOG': str(self.log)}

    def tearDown(self):
        self.temp.cleanup()

    def run_audit(self, *args):
        return subprocess.run(['python3', str(SCRIPT), '--project', 'test-project', *args],
                              env=self.env, capture_output=True, text=True, timeout=15)

    def test_plan_has_no_cloud_calls_or_output(self):
        out = self.base / 'report'
        result = self.run_audit('--out', str(out))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(self.log.exists())
        self.assertFalse(out.exists())
        self.assertIn('gcloud', result.stdout)

    def test_execute_uses_bounded_read_commands_and_private_files(self):
        out = self.base / 'report'
        result = self.run_audit('--execute', '--max-metrics', '0', '--out', str(out))
        self.assertEqual(result.returncode, 0, result.stderr)
        commands = [json.loads(line) for line in self.log.read_text().splitlines()]
        self.assertTrue(commands)
        for command in commands:
            self.assertTrue('list' in command or command[:2] == ['projects', 'describe'])
            if 'list' in command:
                self.assertIn('--limit=1000', command)
        self.assertEqual(out.stat().st_mode & 0o777, 0o700)
        for name in ['audit.json', 'audit.md']:
            self.assertEqual((out / name).stat().st_mode & 0o777, 0o600)
        report = json.loads((out / 'audit.json').read_text())
        self.assertEqual(report['scope']['project'], 'test-project')
        self.assertTrue(report['data_gaps'])
        self.assertTrue(report['findings'])

    def test_existing_directory_and_report_symlink_are_not_overwritten(self):
        out = self.base / 'report'
        out.mkdir()
        victim = self.base / 'victim'
        victim.write_text('preserve me')
        (out / 'audit.json').symlink_to(victim)
        result = self.run_audit('--execute', '--out', str(out))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(victim.read_text(), 'preserve me')
        self.assertFalse(self.log.exists())

    def test_symbolic_parent_is_rejected_before_calls(self):
        (self.base / 'alias').symlink_to(self.bin, target_is_directory=True)
        result = self.run_audit('--execute', '--out', str(self.base / 'alias' / 'report'))
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.log.exists())

    def test_invalid_project_cannot_become_a_cli_flag(self):
        result = self.run_audit('--project=--help')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.log.exists())

    def test_nonfinite_csv_is_reported_as_missing_not_serialized(self):
        csv = self.base / 'cost.csv'
        csv.write_text('service,cost,currency\nCompute,NaN,EUR\n')
        result = self.run_audit('--execute', '--max-metrics', '0', '--cost-csv', str(csv), '--out', str(self.base / 'report'))
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads((self.base / 'report/audit.json').read_text())
        self.assertNotIn('Costes locales aportados por el usuario', report['summary'])
        self.assertTrue(any('CSV' in gap for gap in report['data_gaps']))

    def test_costs_preserve_currency_and_project_scope(self):
        csv = self.base / 'cost.csv'
        csv.write_text('service,cost,currency,project\nCompute,0.10,EUR,test-project\nCompute,0.20,EUR,test-project\nOther,99,EUR,other-project\nStorage,4.25,USD,test-project\n')
        result = self.run_audit('--execute', '--max-metrics', '0', '--cost-csv', str(csv), '--out', str(self.base / 'report'))
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads((self.base / 'report/audit.json').read_text())
        costs = report['summary']['Costes locales aportados por el usuario']
        self.assertEqual(costs['EUR'], [{'service': 'Compute', 'cost': '0.30'}])
        self.assertEqual(costs['USD'], [{'service': 'Storage', 'cost': '4.25'}])


if __name__ == '__main__':
    unittest.main()
