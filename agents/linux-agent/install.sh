#!/usr/bin/env bash
# Fresh-host installation only. Review this file before running it as root.
set -euo pipefail
if [ "$(id -u)" != 0 ] || [ "${1:-}" != --fresh-server ]; then
  echo 'Review README.md, then run as root: bash install.sh --fresh-server' >&2
  exit 2
fi
for command in python3 systemctl sudo visudo useradd getent apt-get; do
  command -v "$command" >/dev/null || { echo "Missing prerequisite: $command" >&2; exit 1; }
done
for account in linux-agent linux-agent-bot; do
  if getent passwd "$account" >/dev/null; then
    echo "Refusing to adopt existing account: $account" >&2; exit 1
  fi
done
for path in /opt/linux-agent /etc/linux-agent /var/lib/linux-agent /var/lib/linux-agent-bot /var/lib/linux-agent-ops /etc/sudoers.d/linux-agent; do
  if [ -e "$path" ] || [ -L "$path" ]; then
    echo "Refusing existing path: $path" >&2; exit 1
  fi
done
for unit in linux-agent-bot.service linux-agent-bridge.service linux-agent-root-enable@.service linux-agent-root-disable.service linux-agent-root-expire.timer linux-agent-maintenance@.service linux-agent-monitor.service linux-agent-monitor.timer; do
  if [ -e "/etc/systemd/system/$unit" ] || [ -L "/etc/systemd/system/$unit" ]; then
    echo "Refusing existing unit: $unit" >&2; exit 1
  fi
done
source_dir=$(cd -- "$(dirname -- "$0")" && pwd)
# Validate the rule before creating accounts or modifying system directories.
visudo -cf "$source_dir/sudoers" >/dev/null
useradd --system --user-group --create-home --home-dir /var/lib/linux-agent --shell /usr/sbin/nologin linux-agent
useradd --system --user-group --home-dir /var/lib/linux-agent-bot --shell /usr/sbin/nologin linux-agent-bot
install -d -o root -g root -m 0755 /opt/linux-agent /opt/linux-agent/bin
install -o root -g root -m 0644 "$source_dir/"*.py /opt/linux-agent/
install -o root -g root -m 0755 "$source_dir/bin/"* /opt/linux-agent/bin/
install -d -o root -g linux-agent-bot -m 0750 /etc/linux-agent
install -o root -g linux-agent-bot -m 0640 "$source_dir/examples/telegram.env.example" /etc/linux-agent/telegram.env
install -o root -g root -m 0644 "$source_dir/examples/server.json" /etc/linux-agent/server.json
install -o root -g root -m 0644 "$source_dir/examples/runtime.json" /etc/linux-agent/runtime.json
# The agent must read runtime configuration but cannot read the Telegram token.
chmod 0755 /etc/linux-agent
install -d -o linux-agent-bot -g linux-agent-bot -m 0700 /var/lib/linux-agent-bot
install -d -o root -g linux-agent-bot -m 2750 /var/lib/linux-agent-ops
chmod 0700 /var/lib/linux-agent
install -d -o root -g root -m 0755 /opt/linux-agent/workspace
install -d -o linux-agent -g linux-agent -m 0700 /opt/linux-agent/workspace/work
install -o root -g root -m 0644 "$source_dir/HARNESS.md" /opt/linux-agent/HARNESS.md
install -o root -g root -m 0644 "$source_dir/HARNESS.md" /opt/linux-agent/workspace/AGENTS.md
install -o root -g root -m 0440 "$source_dir/sudoers" /etc/sudoers.d/linux-agent
install -o root -g root -m 0644 "$source_dir/systemd/"* /etc/systemd/system/
visudo -c >/dev/null
systemctl daemon-reload
systemctl enable linux-agent-root-disable.service
systemctl start linux-agent-root-disable.service
printf '%s\n' 'Installed with root closed. Services are NOT started automatically.' \
  'Configure /etc/linux-agent, authenticate the runtime as linux-agent, then follow README.md.'
