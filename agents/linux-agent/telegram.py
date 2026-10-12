"""Telegram cloud API. Tokens are read only by the bot account, never logged."""
import json
import urllib.request
from settings import environment


class TelegramError(Exception):
    pass


def api(method, payload):
    token = environment()['TELEGRAM_BOT_TOKEN']
    request = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/{method}',
        data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            body = json.load(response)
        if not body.get('ok'):
            raise TelegramError('Telegram request rejected')
        return body['result']
    except Exception:
        raise TelegramError('Telegram unavailable') from None


def send(text, topic=None, keyboard=None):
    # Plain text prevents model output from injecting markup or control callbacks.
    for offset in range(0, len(text), 3500):
        payload = dict(chat_id=int(environment()['TELEGRAM_OWNER_ID']), text=text[offset:offset + 3500])
        if topic is not None:
            payload['message_thread_id'] = topic
        if keyboard and offset == 0:
            payload['reply_markup'] = {'inline_keyboard': keyboard}
        api('sendMessage', payload)
