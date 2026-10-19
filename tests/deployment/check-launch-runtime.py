"""Exercise runtime serialization and the narrowly scoped public indexing change."""
import ast, json, os, subprocess, tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[2]
source = ast.parse((root / 'scripts/configure-ai-runtime.py').read_text())
remote = next(ast.literal_eval(node.value) for node in source.body if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == 'remote' for target in node.targets))
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
    public = home / 'agentrepo.dev/.htaccess'
    public.parent.mkdir()
    public.write_text('Options -Indexes\nHeader always set X-Robots-Tag "noindex, nofollow, noarchive"\n# keep this\n')
    private = home / 'admin.agentrepo.dev/.htaccess'
    private.parent.mkdir()
    private.write_text('Header always set X-Robots-Tag "noindex"\n')
    subprocess.run(['python3', str(root / 'scripts/enable-public-indexing.py')], env=environment, check=True, capture_output=True)
    assert public.read_text() == 'Options -Indexes\n# keep this\n'
    assert 'noindex' in private.read_text()
print('Runtime serialization, permissions and public/private indexing checks passed')
