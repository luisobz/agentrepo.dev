import json,os,subprocess,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SCRIPT=ROOT/'skills/optimice-aws/scripts/audit.py'
FAKE='''#!/usr/bin/env python3
import os,sys,json
from datetime import datetime,timedelta,timezone
args=sys.argv[1:]
with open(os.environ['CALL_LOG'],'a') as f:f.write(json.dumps(args)+'\\n')
mode=os.environ.get('FAKE_MODE','normal')
assert os.environ.get('AWS_IGNORE_CONFIGURED_ENDPOINT_URLS')=='true'
if mode=='error':sys.stderr.write('private-marker');sys.exit(1)
if 'get-caller-identity' in args:data={'Account':'222222222222' if mode=='mismatch' else '111111111111','Arn':'arn:aws:sts::111111111111:assumed-role/test/session'}
elif 'get-cost-and-usage' in args:data={'ResultsByTime':[{'Groups':[{'Keys':['EC2'],'Metrics':{'UnblendedCost':{'Amount':'12.5','Unit':'USD'}}}]}]}
elif 'describe-instances' in args:data={'Reservations':[{'Instances':[{'InstanceId':'i-1234567890abcdef0','State':{'Name':'running'},'InstanceType':'t3.small'}]}]}
elif 'get-metric-statistics' in args:
 now=datetime.now(timezone.utc)
 data={'Datapoints':[{'Timestamp':(now-timedelta(days=x+1)).strftime('%Y-%m-%dT00:00:00Z'),'Average':5,'Maximum':95} for x in range(5 if mode=='sparse' else 30)]}
elif 'describe-volumes' in args:data={'Volumes':[{'VolumeId':'vol-last','State':'available','Size':8}]*101}
else:data={}
if mode=='pagination':data['NextToken']='untrusted-page'
print(json.dumps(data))
'''
class AuditTest(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.log=self.base/'calls';(self.base/'aws').write_text(FAKE);(self.base/'aws').chmod(0o700)
  self.env={**os.environ,'PATH':str(self.base)+':'+os.environ['PATH'],'CALL_LOG':str(self.log)}
 def tearDown(self):self.tmp.cleanup()
 def run_audit(self,*args,mode='normal'):
  return subprocess.run(['python3',str(SCRIPT),'--profile','synthetic','--account-id','111111111111','--regions','eu-west-1','--out',str(self.base/'out'),*args],env={**self.env,'FAKE_MODE':mode},capture_output=True,text=True)
 def report(self):return json.loads((self.base/'out/audit.json').read_text())
 def calls(self):return [json.loads(x) for x in self.log.read_text().splitlines()]
 def test_plan_no_cloud_or_output(self):
  r=self.run_audit();self.assertEqual(r.returncode,0,r.stderr);self.assertFalse(self.log.exists());self.assertFalse((self.base/'out').exists())
 def test_mismatch_stops(self):
  r=self.run_audit('--execute',mode='mismatch');self.assertNotEqual(r.returncode,0);self.assertEqual(len(self.calls()),1)
 def test_identity_failure_stops(self):
  r=self.run_audit('--execute',mode='error');self.assertNotEqual(r.returncode,0);self.assertEqual(len(self.calls()),1);self.assertNotIn('private-marker',json.dumps(self.report()))
 def test_existing_output_not_overwritten(self):
  (self.base/'out').mkdir();(self.base/'out/audit.json').write_text('keep');r=self.run_audit('--execute');self.assertNotEqual(r.returncode,0);self.assertFalse(self.log.exists());self.assertEqual((self.base/'out/audit.json').read_text(),'keep')
 def test_sparse_cpu_not_right_sized(self):
  r=self.run_audit('--execute',mode='sparse');self.assertEqual(r.returncode,0,r.stderr);self.assertFalse(any('right-sizing' in f['category'] for f in self.report()['findings']))
 def test_scope_private_files_and_all_disks(self):
  r=self.run_audit('--execute');self.assertEqual(r.returncode,0,r.stderr)
  calls=self.calls();cost=next(c for c in calls if 'get-cost-and-usage' in c);self.assertIn('111111111111',cost[cost.index('--filter')+1]);self.assertEqual(len([f for f in self.report()['findings'] if f['category']=='EBS sin adjuntar']),101)
  self.assertEqual((self.base/'out').stat().st_mode&0o777,0o700);self.assertEqual((self.base/'out/audit.json').stat().st_mode&0o777,0o600)
  cpu=next(f for f in self.report()['findings'] if 'right-sizing' in f['category']);self.assertIn('95',cpu['evidence'])
 def test_pagination_is_reported_without_following(self):
  r=self.run_audit('--execute',mode='pagination');self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(any('paginación' in x for x in self.report()['data_gaps']));self.assertFalse(any('--next-token' in c for c in self.calls()))
 def test_noncommercial_regions_never_call_cli(self):
  for region in ['us-gov-west-1','cn-north-1','us-iso-east-1']:
   r=self.run_audit('--regions',region,'--execute');self.assertNotEqual(r.returncode,0);self.assertFalse(self.log.exists())
 def test_invalid_account_never_calls_cli(self):
  r=self.run_audit('--account-id','invalid','--execute');self.assertNotEqual(r.returncode,0);self.assertFalse(self.log.exists())
 def test_symlink_output_rejected(self):
  victim=self.base/'victim';victim.mkdir();(self.base/'out').symlink_to(victim,target_is_directory=True);r=self.run_audit('--execute');self.assertNotEqual(r.returncode,0);self.assertFalse(self.log.exists());self.assertEqual(list(victim.iterdir()),[])
 def test_only_expected_read_operations(self):
  r=self.run_audit('--execute');self.assertEqual(r.returncode,0,r.stderr)
  allowed={'get-caller-identity','get-cost-and-usage','list-buckets','get-reservation-utilization','get-savings-plans-utilization','describe-instances','describe-volumes','describe-addresses','describe-nat-gateways','describe-vpc-endpoints','describe-load-balancers','describe-log-groups','describe-auto-scaling-groups','list-clusters','describe-db-instances','get-metric-statistics'}
  for call in self.calls():self.assertEqual(len(set(call)&allowed),1);self.assertEqual(call[call.index('--profile')+1],'synthetic');self.assertIn('--region',call)
if __name__=='__main__':unittest.main()
