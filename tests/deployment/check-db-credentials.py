"""Prove the database password reaches libpq without entering files or argv."""
import json, os, subprocess, tempfile
from pathlib import Path
root = Path(__file__).resolve().parents[2]
with tempfile.TemporaryDirectory() as temporary:
    directory = Path(temporary)
    binaries = directory / 'bin'
    binaries.mkdir()
    docker = binaries / 'docker'
    docker.write_text('''#!/usr/bin/env python3
import os,sys,json
print(json.dumps({'passwordMatches':os.environ.get('PGPASSWORD')==os.environ['EXPECTED_PASSWORD'],'secretInArguments':os.environ['EXPECTED_PASSWORD'] in ' '.join(sys.argv),'databaseUrlInherited':'DATABASE_URL' in os.environ,'arguments':sys.argv[1:]}))
''')
    docker.chmod(0o755)
    secret = 'synthetic-p%assword'
    environment = dict(os.environ, PATH=str(binaries)+':'+os.environ['PATH'], DATABASE_URL='postgresql://user:synthetic-p%25assword@localhost:5432/test', DB_WORK_DIR=str(directory), EXPECTED_PASSWORD=secret)
    subprocess.run(['python3', str(root/'scripts/db/db-url-to-env.py')], env=environment, check=True)
    stored = (directory/'db.env').read_text()
    assert 'PGPASSWORD' not in stored and secret not in stored
    assert (directory/'db.env').stat().st_mode & 0o777 == 0o600
    run = subprocess.run(['bash', str(root/'scripts/db/postgres-client.sh'), 'psql', '-c', 'SELECT 1'], env=environment, capture_output=True, text=True, check=True)
    result = json.loads(run.stdout)
    assert result['passwordMatches'] and not result['secretInArguments'] and not result['databaseUrlInherited']
    assert result['arguments'][-3:] == ['psql','-c','SELECT 1']
print('Database password stays in memory; private non-secret settings and process arguments verified')
