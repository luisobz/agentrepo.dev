"""Root-only fixed operations. No shell, arbitrary commands or automatic upgrades."""
import fcntl
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from settings import configuration

ROOT = Path('/var/lib/linux-agent-ops')


def command_for(action, config):
    commands = {
        'apt-refresh': ['/usr/bin/apt-get', 'update'],
        'apt-upgrade': ['/usr/bin/apt-get', '-y', '--with-new-pkgs', 'upgrade'],
        'reboot': ['/usr/sbin/shutdown', '-r', '+1'],
    }
    if action in commands:
        return commands[action]
    if action.startswith('restart--'):
        service = action[len('restart--'):]
        if service in config.get('services', []):
            return ['/usr/bin/systemctl', 'restart', service]
    raise ValueError('Operation not allowed')


def lease_active(now=None):
    try:
        expiry = int(Path('/run/linux-agent-root-window/expiry').read_text())
        return expiry > (time.time() if now is None else now)
    except (OSError, ValueError):
        return False


def save(data):
    temporary = ROOT / 'result.tmp'
    temporary.write_text(json.dumps(data))
    temporary.chmod(0o640)
    temporary.replace(ROOT / 'result.json')


def main():
    if os.geteuid() != 0 or len(sys.argv) != 2:
        raise SystemExit(2)
    action = sys.argv[1]
    command = command_for(action, configuration())
    with (ROOT / 'lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if not lease_active():
            save(dict(action=action, status='denied', reason='Root lease is closed'))
            raise SystemExit(1)
        save(dict(action=action, status='running', started=time.time()))
        # Root-owned directory: the agent/bot cannot substitute the log with a symlink.
        with (ROOT / 'last-operation.log').open('w') as output:
            result = subprocess.run(command, stdout=output, stderr=subprocess.STDOUT,
                                    env={'PATH': '/usr/sbin:/usr/bin:/sbin:/bin',
                                         'DEBIAN_FRONTEND': 'noninteractive', 'LC_ALL': 'C'})
        save(dict(action=action, status='success' if result.returncode == 0 else 'failed',
                  finished=time.time(), returncode=result.returncode))
        raise SystemExit(result.returncode)


if __name__ == '__main__':
    main()
