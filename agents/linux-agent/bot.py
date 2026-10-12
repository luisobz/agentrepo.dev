"""Human control plane: private chat, one owner, expiring single-use approvals."""
import json
import subprocess
import time
from pathlib import Path
from policy import authorized, duration, ConfirmationStore
from settings import STATE, environment, configuration
from telegram import api, send, TelegramError
from sessions import enqueue, connection

HELP = '''Linux Agent
/new [title] — create an isolated agent session/topic
/sessions — registered sessions
/status — system and maintenance status
/updates — simulate package upgrades
/root [15m|2h|off|status] — temporary root (confirmation required)
/refresh — refresh APT metadata (confirmation + root)
/upgrade — upgrade packages (confirmation + root)
/restart name.service — restart a configured service (confirmation + root)
/reboot — reboot in one minute (confirmation + root)
Use registered session topics for the agent. Unknown topics never route messages.
Model answers and downloaded content cannot approve root.'''


class Bot:
    def __init__(self):
        self.owner = int(environment()['TELEGRAM_OWNER_ID'])
        self.confirmations = ConfirmationStore()

    def control(self, action, value=None):
        result = subprocess.run(['sudo', '-n', '/opt/linux-agent/bin/control'],
                                input=json.dumps(dict(action=action, value=value)),
                                text=True, capture_output=True, timeout=20)
        return result.returncode == 0

    def confirm(self, action, value, topic):
        token = self.confirmations.create(action, value, self.owner, topic)
        warning = ('Root grants full sudo to the agent account; it can modify the entire server.'
                   if action == 'root' else 'This operation changes the server and requires an active root window.')
        send(f'Confirm {action} {value or ""}? Expires in 2 minutes. ' + warning, topic,
             [[{'text': 'Confirm', 'callback_data': 'yes:' + token},
               {'text': 'Cancel', 'callback_data': 'no:' + token}]])

    def callback(self, callback):
        message = callback.get('message', {})
        identity = {'from': callback.get('from', {}), 'chat': message.get('chat', {})}
        if not authorized(identity, self.owner):
            return
        data = callback.get('data', '').split(':', 1)
        if len(data) != 2 or data[0] not in {'yes', 'no'}:
            return
        topic = message.get('message_thread_id')
        action = self.confirmations.consume(data[1], self.owner, topic)
        api('answerCallbackQuery', dict(callback_query_id=callback['id']))
        if not action:
            send('Confirmation expired, consumed or belongs to another topic.', topic)
        elif data[0] == 'no':
            send('Cancelled.', topic)
        elif self.control(*action):
            send('Request submitted. /status shows the actual result; acceptance is not completion.', topic)
        else:
            send('Request rejected; inspect the service journal from your admin terminal.', topic)

    def status(self):
        result = {}
        for key, path in [('maintenance', '/var/lib/linux-agent-ops/result.json'),
                          ('health', str(STATE / 'health.json'))]:
            try:
                result[key] = json.loads(Path(path).read_text())
            except (OSError, ValueError):
                result[key] = 'unknown'
        try:
            result['root_seconds'] = max(0, int(Path('/run/linux-agent-root-window/expiry').read_text()) - int(time.time()))
        except (OSError, ValueError):
            result['root_seconds'] = 0
        return json.dumps(result, indent=2)

    def message(self, message):
        if not authorized(message, self.owner):
            return
        text = message.get('text', '').strip()
        topic = message.get('message_thread_id')
        if not text:
            return
        parts = text.split()
        command = parts[0].split('@')[0]
        if command in {'/start', '/help'}:
            send(HELP, topic)
        elif command == '/new':
            with connection() as db:
                if db.execute('SELECT count(*) FROM inbox WHERE delivered=0').fetchone()[0] < 100:
                    db.execute('INSERT INTO inbox(thread,text) VALUES(?,?)', ('new', ' '.join(parts[1:])[:100] or 'Server agent'))
            send('Session requested; its topic will appear when the runtime is connected.', topic)
        elif command == '/sessions':
            with connection() as db:
                rows = db.execute('SELECT title,topic FROM sessions LIMIT 100').fetchall()
            send('\n'.join(f"{row['title']} · topic {row['topic']}" for row in rows) or 'No sessions. Use /new.', topic)
        elif command == '/status':
            send(self.status(), topic)
        elif command == '/updates':
            result = subprocess.run(['/usr/bin/apt-get', '-s', 'upgrade'], capture_output=True,
                                    text=True, timeout=30, env={'PATH': '/usr/bin:/bin', 'LC_ALL': 'C'})
            send((result.stdout or 'APT simulation unavailable')[-12000:], topic)
        elif command == '/root':
            argument = parts[1] if len(parts) == 2 else '15m'
            if argument == 'off':
                send('Revocation submitted.' if self.control('revoke') else 'Revocation failed.', topic)
            elif argument == 'status':
                send(self.status(), topic)
            else:
                self.confirm('root', duration(argument), topic)
        elif command in {'/refresh', '/upgrade', '/reboot'}:
            self.confirm({'/refresh': 'apt-refresh', '/upgrade': 'apt-upgrade', '/reboot': 'reboot'}[command], None, topic)
        elif command == '/restart':
            if len(parts) != 2 or parts[1] not in configuration().get('services', []):
                send('Select a service from the root-managed allowlist.', topic)
            else:
                self.confirm('restart', parts[1], topic)
        elif not enqueue(topic, text):
            send('Topic not registered. Use /new to create a session; see the setup guide.', topic)


def main():
    bot = Bot()
    path = STATE / 'offset'
    offset = int(path.read_text()) if path.exists() else 0
    while True:
        try:
            updates = api('getUpdates', dict(offset=offset, timeout=25,
                                             allowed_updates=['message', 'callback_query']))
            for update in updates:
                try:
                    if 'callback_query' in update:
                        bot.callback(update['callback_query'])
                    elif 'message' in update:
                        bot.message(update['message'])
                except (ValueError, subprocess.TimeoutExpired):
                    # Drop malformed requests; never log message bodies, tokens or credentials.
                    pass
                offset = update['update_id'] + 1
                temporary = path.with_suffix('.tmp')
                temporary.write_text(str(offset))
                temporary.replace(path)
        except TelegramError:
            print('Telegram unavailable; retrying without logging request URLs', flush=True)
            time.sleep(5)


if __name__ == '__main__':
    main()
