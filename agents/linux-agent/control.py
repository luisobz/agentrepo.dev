"""Fixed sudo entrypoint for the bot, not available to the agent account."""
import json
import os
import subprocess
import sys
import re
from settings import configuration


def unit_for(request):
    action = request.get('action')
    value = request.get('value')
    if action == 'root' and type(value) is int and 60 <= value <= 28800:
        return f'linux-agent-root-enable@{value}.service'
    if action == 'revoke' and value is None:
        return 'linux-agent-root-disable.service'
    if action in {'apt-refresh', 'apt-upgrade', 'reboot'} and value is None:
        return f'linux-agent-maintenance@{action}.service'
    if action == 'restart' and isinstance(value, str) and re.fullmatch(r'[A-Za-z0-9_.@-]+\.service', value):
        if value in configuration().get('services', []):
            return f'linux-agent-maintenance@restart--{value}.service'
    raise ValueError('Invalid privileged operation')


def main():
    if os.geteuid() != 0 or len(sys.argv) != 1:
        raise SystemExit(2)
    try:
        request = json.loads(sys.stdin.read(1024))
        unit = unit_for(request)
    except (ValueError, TypeError, AttributeError):
        raise SystemExit(2)
    result = subprocess.run(['/usr/bin/systemctl', 'start', '--no-block', unit],
                            capture_output=True, timeout=15)
    raise SystemExit(result.returncode)


if __name__ == '__main__':
    main()
