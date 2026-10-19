"""Apply the bounded AI/mail settings through encrypted SSH stdin."""
import json, os, shlex, subprocess

keys = ('DEEPSEEK_API_KEY', 'DEEPSEEK_MODEL', 'SPACEMAIL_HOST', 'SPACEMAIL_PORT', 'SPACEMAIL_USER', 'SPACEMAIL_PASS', 'CONTACT_FORM_NOTIFICATION_EMAIL')
values = {key: os.environ.get(key, '') for key in keys}
if not all(values.values()):
    raise SystemExit('Missing required AI/mail settings; existing runtime left untouched')
remote = r'''
import json, os, tempfile
from pathlib import Path
payload=json.load(__import__('sys').stdin)
root=Path.home()/payload['destination']
assert root.is_dir() and root.is_relative_to(Path.home()/'backend/agentrepo.dev')
path=root/'.env'
old=path.read_text() if path.exists() else ''
keys=set(payload['values'])
lines=[line for line in old.splitlines() if line.split('=',1)[0] not in keys]
lines.extend(key+'='+json.dumps(value) for key,value in payload['values'].items())
fd,tmp=tempfile.mkstemp(prefix='.runtime-',dir=root)
os.fchmod(fd,0o600)
with os.fdopen(fd,'w') as stream:
 stream.write('\n'.join(lines)+'\n');stream.flush();os.fsync(stream.fileno())
os.replace(tmp,path)
print('AI/mail runtime settings applied without exposing values')
'''
command = ['ssh', '-i', os.path.expanduser('~/.ssh/id_deploy'), '-p', os.environ.get('SSH_PORT','22'), '-o', 'StrictHostKeyChecking=yes', os.environ['USER']+'@'+os.environ['HOST'], 'python3 -c '+shlex.quote(remote)]
subprocess.run(command, input=json.dumps({'destination':os.environ['DEST'],'values':values}), text=True, check=True)
