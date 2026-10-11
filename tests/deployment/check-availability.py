"""Exercise maintenance checks without network access or real credentials."""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as directory:
    root = Path(directory)
    shutil.copytree('scripts/db', root / 'scripts/db')
    binaries = root / 'bin'
    binaries.mkdir()
    for name, script in {
        'curl': '#!/bin/sh\nwhile [ "$1" != "--output" ]; do shift; done\ntouch "$2"\n',
        'sleep': '#!/bin/sh\nexit 0\n',
    }.items():
        path = binaries / name
        path.write_text(script)
        path.chmod(0o755)
    client = root / 'scripts/db/postgres-client.sh'
    client.write_text('''#!/bin/sh
printf '%s\\n' "$*" >> "$TEST_CALLS"
grep -Fxq 'PGOPTIONS=-c default_transaction_read_only=on -c statement_timeout=10000' "$DB_WORK_DIR/db.env" || exit 2
if [ "$TEST_RESULT" = unavailable ]; then echo 'private diagnostic' >&2; exit 1; fi
printf '%s\\n' "$TEST_RESULT"
''')
    client.chmod(0o755)
    calls = root / 'calls'
    environment = dict(os.environ, PATH=f'{binaries}:{os.environ["PATH"]}',
                       DATABASE_URL='postgresql://postgres.abcdefghijklmnopqrst:test-password@aws-0-eu-west-3.pooler.supabase.com:5432/postgres',
                       PROJECT_REF='abcdefghijklmnopqrst', TEST_CALLS=str(calls), RUNNER_TEMP=str(root))
    for result, expected, attempts in [('1', 0, 1), ('0', 1, 1), ('unavailable', 1, 3)]:
        calls.unlink(missing_ok=True)
        run = subprocess.run(['bash', 'scripts/db/check-availability.sh'], cwd=root,
                             env=dict(environment, TEST_RESULT=result), capture_output=True, text=True)
        assert run.returncode == expected, run.stdout + run.stderr
        queries = calls.read_text().splitlines()
        assert len(queries) == attempts
        assert all('BEGIN READ ONLY;' in query and 'SELECT CASE' in query for query in queries)
        assert 'test-password' not in run.stdout + run.stderr
        assert 'private diagnostic' not in run.stdout + run.stderr
        assert not list(root.glob('agentrepo-availability.*')), 'Temporary credentials must be cleaned up'
    calls.unlink()
    run = subprocess.run(['bash', 'scripts/db/check-availability.sh'], cwd=root,
                         env=dict(environment, PROJECT_REF='wrong', TEST_RESULT='1'), capture_output=True)
    assert run.returncode != 0 and not calls.exists(), 'Wrong project must fail before connecting'
print('Availability checks: read-only queries, target validation, retries, cleanup and redacted diagnostics passed')
