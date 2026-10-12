"""Sustained resource/service alarms, deduplicated and committed after delivery."""
import json
import os
import shutil
import subprocess
import time
from pathlib import Path
from policy import transition
from settings import STATE, configuration
from telegram import send


def collect(config):
    memory = {line.split(':')[0]: int(line.split()[1]) for line in Path('/proc/meminfo').read_text().splitlines()}
    sample = {'ram': 100 * (1 - memory['MemAvailable'] / memory['MemTotal']),
              'load': os.getloadavg()[0] / (os.cpu_count() or 1)}
    for folder in config.get('mounts', ['/']):
        usage = shutil.disk_usage(folder)
        sample['disk:' + folder] = 100 * usage.used / usage.total
        stats = os.statvfs(folder)
        if stats.f_files:
            sample['inodes:' + folder] = 100 * (1 - stats.f_favail / stats.f_files)
    for service in config.get('services', []):
        result = subprocess.run(['/usr/bin/systemctl', 'is-active', '--quiet', service], timeout=10)
        sample['service:' + service] = result.returncode != 0
    if config.get('monitor_agent', True):
        try:
            age = time.time() - float(Path('/run/linux-agent-heartbeat/heartbeat').read_text())
            sample['agent_bridge'] = not 0 <= age < 180
        except (OSError, ValueError):
            sample['agent_bridge'] = True
    return sample


def evaluate(state, sample, now, emit, config):
    records = state.setdefault('alarms', {})
    gap = now - state.get('sample_time', now)
    if gap < 0 or gap > 180:
        for record in records.values():
            record.pop('candidate', None)
            record.pop('since', None)
    for key, value in sample.items():
        record = records.setdefault(key, {})
        if isinstance(value, bool):
            bad = value
        else:
            threshold = config.get('thresholds', {}).get(key.split(':')[0], {'ram': 90, 'load': 1.5}.get(key, 85))
            bad = value >= threshold if not record.get('active') else value > threshold - 5
            if key == 'load' and record.get('active'):
                bad = value > threshold - 0.3
        event = transition(record, bad, now, config.get('alert_seconds', 300), config.get('clear_seconds', 300))
        if event and emit(f'{"ALERT" if event == "alert" else "RECOVERED"}: {key} = {value}'):
            record.update(active=bad, last_sent=now)
    state.update(sample_time=now)
    return {key: value for key, value in records.items() if value.get('active')}


def main():
    config = configuration()
    path = STATE / 'monitor.json'
    state = json.loads(path.read_text()) if path.exists() else {}
    try:
        sample = collect(config)
    except (OSError, subprocess.TimeoutExpired):
        raise SystemExit('Monitoring sample unavailable; no recovery inferred') from None
    def emit(text):
        try:
            send(text)
            return True
        except Exception:
            return False
    active = evaluate(state, sample, time.time(), emit, config)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(state))
    temporary.replace(path)
    (STATE / 'health.json').write_text(json.dumps(dict(sample=sample, alarms=list(active), checked_at=time.time())))


if __name__ == '__main__':
    main()
