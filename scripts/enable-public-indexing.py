"""Remove only the launch hold from the public AgentRepo document root."""
from pathlib import Path
import re, shutil

target = Path.home() / 'agentrepo.dev' / '.htaccess'
if target.is_file():
    original = target.read_text()
    updated = re.sub(r'^Header always set X-Robots-Tag "noindex, nofollow, noarchive"\s*\n?', '', original, flags=re.MULTILINE)
    if updated != original:
        backup = Path.home() / 'backend/agentrepo.dev/.launch-backups'
        backup.mkdir(mode=0o700, parents=True, exist_ok=True)
        shutil.copyfile(target, backup / 'public-htaccess-before-indexing')
        target.write_text(updated)
    if re.search(r'^[^#\n]*X-Robots-Tag[^\n]*noindex', updated, re.MULTILINE | re.IGNORECASE):
        raise SystemExit('Unexpected public noindex header remains; review configuration')
robots = target.parent / 'robots.txt'
if robots.is_file() and robots.read_text().strip() == 'User-agent: *\nDisallow: /':
    backup = Path.home() / 'backend/agentrepo.dev/.launch-backups'
    backup.mkdir(mode=0o700, parents=True, exist_ok=True)
    shutil.copyfile(robots, backup / 'public-robots-before-indexing')
    robots.unlink()
print('Public indexing hold cleared; private application headers preserved')
