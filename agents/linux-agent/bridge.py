"""Isolated agent runtime; only the bot's owner-authenticated inbox starts turns."""
import json
import queue
import secrets
import subprocess
import time
from pathlib import Path
from rpc import RPC

HOME = Path('/var/lib/linux-agent')


class RelayError(Exception):
    pass


class Relay:
    def __init__(self):
        self.process = subprocess.Popen(['sudo', '-n', '-u', 'linux-agent-bot', '/opt/linux-agent/bin/relay'],
                                        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                        stderr=subprocess.DEVNULL, text=True)

    def call(self, operation, **values):
        self.process.stdin.write(json.dumps(dict(op=operation, **values)) + '\n')
        self.process.stdin.flush()
        # No shell or arbitrary executable can be selected via this protocol.
        ready = queue.Queue()
        import threading
        threading.Thread(target=lambda: ready.put(self.process.stdout.readline()), daemon=True).start()
        line = ready.get(timeout=45)
        result = json.loads(line)
        if not result.get('ok'):
            raise RelayError('Relay unavailable or operation rejected')
        return result['result']

    def close(self):
        self.process.terminate()
        self.process.wait(timeout=10)


class Bridge:
    def __init__(self):
        config = json.loads(Path('/etc/linux-agent/runtime.json').read_text())
        self.config = config
        self.rpc, self.relay = RPC(config['codex']), Relay()
        self.approvals, self.threads = {}, set()

    def publish(self, thread, key, text):
        self.relay.call('publish', thread=thread, key=thread + ':' + key, text=text)

    def discover(self):
        threads = self.rpc.call('thread/list', dict(limit=100, sortKey='updated_at')).get('data', [])
        for thread in threads:
            identifier = thread['id']
            if identifier not in self.threads:
                self.relay.call('register', thread=identifier, title=thread.get('name') or 'Server agent')
                self.rpc.call('thread/resume', dict(threadId=identifier, excludeTurns=True))
                self.threads.add(identifier)
            turns = self.rpc.call('thread/turns/list', dict(threadId=identifier, limit=2, itemsView='full')).get('data', [])
            for turn in turns:
                if turn.get('status') != 'inProgress':
                    for item in turn.get('items', []):
                        if item.get('type') == 'agentMessage':
                            self.publish(identifier, item['id'], item.get('text', ''))

    def inbound(self):
        for message in self.relay.call('poll'):
            identifier, text = message['thread'], message['text']
            if identifier == 'new':
                params = dict(cwd='/opt/linux-agent/workspace/work', approvalPolicy='on-request', sandbox='workspace-write',
                              developerInstructions=Path('/opt/linux-agent/HARNESS.md').read_text())
                if self.config.get('model'):
                    params['model'] = self.config['model']
                thread = self.rpc.call('thread/start', params)['thread']
                self.relay.call('register', thread=thread['id'], title=text[:100])
                self.threads.add(thread['id'])
                self.rpc.call('turn/start', dict(threadId=thread['id'], input=[dict(type='text', text='Session initialized by the owner. Reply briefly that you are ready. Do not execute commands or change anything.')]))
                self.publish(thread['id'], 'welcome', 'Session ready. OS root is disabled unless the owner opens a root window. Runtime sandbox remains independently configured.')
            else:
                self.deliver(identifier, text)
            self.relay.call('ack', id=message['id'])

    def deliver(self, identifier, text):
        if identifier not in self.threads:
            raise RelayError('Session not registered')
        if text.startswith(('/approve ', '/deny ')):
            operation, token = text.split(maxsplit=1)
            approval = self.approvals.get(token)
            if not approval or approval['thread'] != identifier or approval['expires'] <= time.time():
                self.publish(identifier, 'expired-' + token, 'Approval expired or belongs to another session; nothing authorized.')
                return
            del self.approvals[token]
            self.rpc.write(dict(id=approval['id'], result=dict(decision='accept' if operation == '/approve' else 'decline')))
            return
        turns = self.rpc.call('thread/turns/list', dict(threadId=identifier, limit=2, itemsView='full')).get('data', [])
        active = next((turn for turn in turns if turn.get('status') == 'inProgress'), None)
        if text == '/agentstop':
            if active:
                self.rpc.call('turn/interrupt', dict(threadId=identifier, turnId=active['id']))
        elif active:
            self.rpc.call('turn/steer', dict(threadId=identifier, expectedTurnId=active['id'], input=[dict(type='text', text=text)]))
        else:
            self.rpc.call('turn/start', dict(threadId=identifier, input=[dict(type='text', text=text)]))

    def events(self):
        while True:
            try:
                event = self.rpc.events.get_nowait()
            except queue.Empty:
                break
            if event.get('disconnected'):
                raise RelayError('Runtime disconnected')
            params, method = event.get('params', {}), event.get('method')
            identifier = params.get('threadId')
            if identifier not in self.threads:
                if 'id' in event and method:
                    self.rpc.write(dict(id=event['id'], error=dict(code=-32601, message='Unknown session; not approved')))
                continue
            if method == 'item/completed' and params.get('item', {}).get('type') == 'agentMessage':
                item = params['item']
                self.publish(identifier, item['id'], item.get('text', ''))
            elif method in {'item/commandExecution/requestApproval', 'item/fileChange/requestApproval'} and 'id' in event:
                token = secrets.token_hex(12)
                self.approvals[token] = dict(id=event['id'], thread=identifier, expires=time.time() + 120)
                details = json.dumps({key: params[key] for key in ('command', 'cwd', 'reason', 'grantRoot') if key in params}, ensure_ascii=False)[:2400]
                self.publish(identifier, 'approval-' + token, 'Runtime approval requested (2 minutes). Review this untrusted runtime description; separate from OS root.\n' + details + '\n/approve ' + token + '\n/deny ' + token)
            elif 'id' in event and method:
                self.rpc.write(dict(id=event['id'], error=dict(code=-32601, message='Unsupported request; not approved')))
        for token, row in list(self.approvals.items()):
            if row['expires'] <= time.time():
                self.rpc.write(dict(id=row['id'], result=dict(decision='decline')))
                del self.approvals[token]

    def loop(self):
        last = 0
        while True:
            self.events()
            if time.time() - last > 15:
                self.discover()
                last = time.time()
            self.inbound()
            path = Path('/run/linux-agent-heartbeat/heartbeat')
            temporary = path.with_suffix('.tmp')
            temporary.write_text(str(time.time()))
            temporary.chmod(0o644)
            temporary.replace(path)
            time.sleep(2)

    def close(self):
        self.rpc.close()
        self.relay.close()


def main():
    bridge = Bridge()
    try:
        bridge.loop()
    finally:
        bridge.close()


if __name__ == '__main__':
    main()
