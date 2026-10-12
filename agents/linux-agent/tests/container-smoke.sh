#!/usr/bin/env bash
# Run only inside a disposable Debian container, never on the host.
set -euo pipefail
[ -f /.dockerenv ] || { echo 'Disposable container required' >&2; exit 2; }
# systemd is not PID 1 here. Simulate scheduling only; test real sudo/filesystem rules.
cp /usr/bin/systemctl /usr/bin/systemctl.real
cat > /usr/bin/systemctl <<'MOCK'
#!/bin/sh
exit 0
MOCK
chmod 755 /usr/bin/systemctl
bash /kit/install.sh --fresh-server
if bash /kit/install.sh --fresh-server; then echo 'Existing installation was overwritten'; exit 1; fi
if sudo -u linux-agent sudo -n /usr/bin/true 2>/dev/null; then echo 'Agent already has root'; exit 1; fi
if sudo -u linux-agent /usr/bin/touch /opt/linux-agent/control.py 2>/dev/null; then exit 1; fi
if sudo -u linux-agent /bin/rm /opt/linux-agent/workspace/AGENTS.md 2>/dev/null; then exit 1; fi
if sudo -u linux-agent /usr/bin/touch /opt/linux-agent/workspace/AGENTS.md 2>/dev/null; then exit 1; fi
if sudo -u linux-agent /bin/cat /etc/linux-agent/telegram.env 2>/dev/null; then exit 1; fi
if sudo -u linux-agent sudo -n -u linux-agent-bot /bin/sh -c id 2>/dev/null; then exit 1; fi
if sudo -u linux-agent sudo -n /opt/linux-agent/bin/control 2>/dev/null; then exit 1; fi
printf '%s\n' '{"op":"root","value":900}' | sudo -u linux-agent sudo -n -u linux-agent-bot /opt/linux-agent/bin/relay | grep -q '"ok": false'
python3 -Es /opt/linux-agent/root_window.py enable 60
sudo -u linux-agent sudo -n /usr/bin/id -u | grep -Fx 0
python3 -Es /opt/linux-agent/root_window.py disable
if sudo -u linux-agent sudo -n /usr/bin/true 2>/dev/null; then echo 'Revocation failed'; exit 1; fi
# An expired NOTAFTER must reject sudo even if the timer did not remove the rule.
printf '%s\n' 'Defaults:linux-agent timestamp_timeout=0' 'linux-agent ALL=(ALL:ALL) NOTAFTER=20000101000000Z NOPASSWD: ALL' > /etc/sudoers.d/linux-agent-telegram-window
chmod 440 /etc/sudoers.d/linux-agent-telegram-window
visudo -cf /etc/sudoers.d/linux-agent-telegram-window
if sudo -u linux-agent sudo -n /usr/bin/true 2>/dev/null; then echo 'Expired rule accepted'; exit 1; fi
rm /etc/sudoers.d/linux-agent-telegram-window
# Invalid bounds must fail closed and never create a rule.
if python3 -Es /opt/linux-agent/root_window.py enable 999999; then exit 1; fi
test ! -e /etc/sudoers.d/linux-agent-telegram-window
printf '%s\n' 'Container smoke: fresh install, ownership, credential isolation, relay restriction, real sudo grant/revoke/expired NOTAFTER and duration limits OK'
