"""Exercise runtime serialization and the narrowly scoped public indexing change."""
import ast, json, os, subprocess, tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[2]
source = ast.parse((root / 'scripts/configure-ai-runtime.py').read_text())
remote = next(ast.literal_eval(node.value) for node in source.body if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == 'remote' for target in node.targets))
assert '.is_relative_to(' not in remote, 'Remote hosting runs Python 3.6; avoid newer pathlib methods'
with tempfile.TemporaryDirectory() as directory:
    home = Path(directory)
    destination = home / 'backend/agentrepo.dev/backend-ai'
    destination.mkdir(parents=True)
    env_file = destination / '.env'
    env_file.write_text('AUTH_SECRET=preserved\nDEEPSEEK_MODEL=old\n')
    values = {'DEEPSEEK_MODEL': 'deepseek-flash', 'SPACEMAIL_PASS': 'test "quoted" \\ value'}
    environment = {**os.environ, 'HOME': directory}
    subprocess.run(['python3', '-c', remote], input=json.dumps({'destination': 'backend/agentrepo.dev/backend-ai', 'values': values}), text=True, env=environment, check=True, capture_output=True)
    lines = env_file.read_text().splitlines()
    assert len(lines) == 3 and lines[0] == 'AUTH_SECRET=preserved'
    assert json.loads(lines[2].split('=', 1)[1]) == values['SPACEMAIL_PASS']
    assert env_file.stat().st_mode & 0o777 == 0o600
    outside = home / 'outside'
    outside.mkdir()
    (outside / '.env').write_text('untouched')
    (destination.parent / 'escape').symlink_to(outside, target_is_directory=True)
    rejected = subprocess.run(['python3', '-c', remote], input=json.dumps({'destination': 'backend/agentrepo.dev/escape', 'values': values}), text=True, env=environment, capture_output=True)
    assert rejected.returncode != 0 and (outside / '.env').read_text() == 'untouched'
    public = home / 'agentrepo.dev/.htaccess'
    public.parent.mkdir()
    public.write_text('Options -Indexes\nHeader always set X-Robots-Tag "noindex, nofollow, noarchive"\n# keep this\n')
    robots = public.parent / 'robots.txt'
    robots.write_text('User-agent: *\nDisallow: /\n')
    private = home / 'admin.agentrepo.dev/.htaccess'
    private.parent.mkdir()
    private.write_text('Header always set X-Robots-Tag "noindex"\n')
    subprocess.run(['python3', str(root / 'scripts/enable-public-indexing.py')], env=environment, check=True, capture_output=True)
    assert public.read_text() == 'Options -Indexes\n# keep this\n'
    assert 'noindex' in private.read_text()
    assert not robots.exists(), 'Historical robots.txt must not shadow the application route'
    assert (home / 'backend/agentrepo.dev/.launch-backups/public-robots-before-indexing').is_file()
print('Runtime serialization, permissions and public/private indexing checks passed')
