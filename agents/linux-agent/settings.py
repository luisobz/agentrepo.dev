"""Root-managed configuration; no environment inherited from sudo callers."""
import json
from pathlib import Path

CONFIG = Path('/etc/linux-agent')
STATE = Path('/var/lib/linux-agent-bot')


def environment():
    result = {}
    for line in (CONFIG / 'telegram.env').read_text().splitlines():
        if line.strip() and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            result[key.strip()] = value.strip()
    owner = int(result['TELEGRAM_OWNER_ID'])
    if owner <= 0 or not result['TELEGRAM_BOT_TOKEN']:
        raise ValueError('Configure a private-chat owner and bot token')
    return result


def configuration():
    return json.loads((CONFIG / 'server.json').read_text())
