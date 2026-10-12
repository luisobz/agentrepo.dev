"""Control-plane decisions; never infer authorization from model output."""
import re
import secrets
import time


def authorized(message, owner):
    return (message.get('from', {}).get('id') == owner
            and message.get('chat', {}).get('id') == owner
            and message.get('chat', {}).get('type') == 'private')


def duration(value):
    match = re.fullmatch(r'([0-9]{1,5})(m|h)?', value)
    if not match:
        raise ValueError('Use minutes or hours, e.g. 15m or 2h')
    seconds = int(match[1]) * (3600 if match[2] == 'h' else 60)
    if not 60 <= seconds <= 28800:
        raise ValueError('Root duration must be between 1 minute and 8 hours')
    return seconds


class ConfirmationStore:
    def __init__(self):
        self.pending = {}

    def create(self, action, value, owner, topic, now=None):
        now = time.time() if now is None else now
        self.pending = {key: row for key, row in self.pending.items() if row['expires'] > now}
        if len(self.pending) >= 50:
            raise ValueError('Too many pending confirmations')
        token = secrets.token_hex(12)
        self.pending[token] = dict(action=action, value=value, owner=owner,
                                   topic=topic, expires=now + 120)
        return token

    def consume(self, token, owner, topic, now=None):
        row = self.pending.get(token)
        now = time.time() if now is None else now
        if not row or row['expires'] <= now:
            self.pending.pop(token, None)
            return None
        if row['owner'] != owner or row['topic'] != topic:
            return None
        del self.pending[token]
        return row['action'], row['value']


def transition(record, bad, now, alert_seconds, clear_seconds):
    if bad is None:
        record.pop('candidate', None)
        record.pop('since', None)
        return None
    if record.get('candidate') != bad:
        record.update(candidate=bad, since=now)
    active = record.get('active', False)
    if bad == active:
        return None
    delay = alert_seconds if bad else clear_seconds
    if now - record['since'] >= delay:
        return 'alert' if bad else 'recovery'
    return None
