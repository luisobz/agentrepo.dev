"""Build only reviewed source files; never package a working directory blindly."""
import gzip
import hashlib
import io
from pathlib import Path
import tarfile

ROOT = Path(__file__).resolve().parents[1]
FILES = '''AGENTS.md HARNESS.md LICENSE README.md VALIDATION.md VERSION
install.sh sudoers bot.py bridge.py control.py maintenance.py monitor.py policy.py
relay.py root_window.py rpc.py sessions.py settings.py telegram.py
bin/control bin/relay examples/runtime.json examples/server.json
examples/telegram.env.example tests/test_policy.py tests/test_security.py
tests/test_publication.py tests/test_bridge.py tests/test_root_window.py tests/container-smoke.sh tools/package.py'''.split()
FILES += ['systemd/' + name for name in '''linux-agent-bot.service
linux-agent-bridge.service linux-agent-maintenance@.service linux-agent-monitor.service
linux-agent-monitor.timer linux-agent-root-disable.service linux-agent-root-enable@.service
linux-agent-root-expire.timer'''.split()]


def build(destination):
    version = (ROOT / 'VERSION').read_text().strip()
    if version != '0.1.0':
        raise ValueError('Review manifest and validation before changing version')
    destination.mkdir(parents=True, exist_ok=True)
    target = destination / f'linux-agent-{version}.tar.gz'
    raw = io.BytesIO()
    with tarfile.open(fileobj=raw, mode='w', format=tarfile.PAX_FORMAT) as archive:
        for name in sorted(FILES):
            source = ROOT / name
            if source.is_symlink() or not source.is_file():
                raise ValueError('Invalid manifest entry')
            data = source.read_bytes()
            info = tarfile.TarInfo(f'linux-agent-{version}/{name}')
            info.size, info.mtime, info.uid, info.gid = len(data), 0, 0, 0
            info.mode = 0o755 if name in {'install.sh', 'bin/control', 'bin/relay', 'tests/container-smoke.sh'} else 0o644
            archive.addfile(info, io.BytesIO(data))
    target.write_bytes(gzip.compress(raw.getvalue(), mtime=0))
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    (destination / 'SHA256SUMS').write_text(f'{digest}  {target.name}\n')
    print(f'Built {target.name}: {len(FILES)} reviewed files')


if __name__ == '__main__':
    import sys
    build(Path(sys.argv[1]))
