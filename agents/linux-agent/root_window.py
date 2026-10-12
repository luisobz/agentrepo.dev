#!/usr/bin/python3
"""Root-owned, bounded sudo window; SSH still requires an authorized key."""
import fcntl
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

DEFAULT_SECONDS = 900
MAX_SECONDS = 8 * 3600
SUDOERS = Path('/etc/sudoers.d/linux-agent-telegram-window')
STATE_DIR = Path('/run/linux-agent-root-window')
EXPIRY = STATE_DIR / 'expiry'
TIMER_OVERRIDE = Path('/run/systemd/system/linux-agent-root-expire.timer.d/window.conf')


def clear_timestamps():
    subprocess.run(['/usr/sbin/runuser', '-u', 'linux-agent', '--', '/usr/bin/sudo', '-K'],
                   check=False, capture_output=True, timeout=10)


def disable():
    SUDOERS.unlink(missing_ok=True)
    EXPIRY.unlink(missing_ok=True)
    clear_timestamps()


def enable(seconds=DEFAULT_SECONDS):
    if not 60 <= seconds <= MAX_SECONDS:
        raise ValueError('Duración fuera del límite de 1 minuto a 8 horas')
    end = datetime.now(timezone.utc) + timedelta(seconds=seconds)
    rule = ('Defaults:linux-agent timestamp_timeout=0\n'
            f'linux-agent ALL=(ALL:ALL) NOTAFTER={end:%Y%m%d%H%M%SZ} NOPASSWD: ALL\n')
    temporary = SUDOERS.with_name(SUDOERS.name + '.tmp')
    try:
        temporary.unlink(missing_ok=True)
        with temporary.open('x') as output:
            output.write(rule)
            output.flush()
            os.fsync(output.fileno())
        temporary.chmod(0o440)
        subprocess.run(['/usr/sbin/visudo', '-cf', str(temporary)],
                       check=True, capture_output=True, timeout=10)
        TIMER_OVERRIDE.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
        TIMER_OVERRIDE.write_text(f'[Timer]\nOnActiveSec=\nOnActiveSec={seconds}s\n')
        subprocess.run(['/usr/bin/systemctl', 'daemon-reload'], check=True, timeout=15)
        os.replace(temporary, SUDOERS)
        expiry_tmp = EXPIRY.with_name('expiry.tmp')
        expiry_tmp.write_text(str(int(end.timestamp())) + '\n')
        expiry_tmp.chmod(0o644)
        os.replace(expiry_tmp, EXPIRY)
        clear_timestamps()
        subprocess.run(['/usr/bin/systemctl', 'restart', 'linux-agent-root-expire.timer'],
                       check=True, capture_output=True, timeout=15)
    except Exception:
        temporary.unlink(missing_ok=True)
        disable()
        raise


def main():
    if os.geteuid() != 0 or len(sys.argv) not in {2, 3}:
        raise SystemExit(2)
    action = sys.argv[1]
    if action not in {'enable', 'disable'} or (action == 'disable' and len(sys.argv) != 2):
        raise SystemExit(2)
    try:
        seconds = int(sys.argv[2]) if len(sys.argv) == 3 else DEFAULT_SECONDS
    except ValueError:
        raise SystemExit(2)
    if action == 'enable' and not 60 <= seconds <= MAX_SECONDS:
        raise SystemExit(2)
    STATE_DIR.mkdir(mode=0o755, exist_ok=True)
    with (STATE_DIR / 'lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        enable(seconds) if action == 'enable' else disable()


if __name__ == '__main__':
    main()
