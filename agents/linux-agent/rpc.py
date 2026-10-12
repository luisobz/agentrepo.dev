"""Codex app-server stdio client. Process output is protocol, never Telegram credentials."""
import json
import queue
import subprocess
import threading


class RPCError(Exception):
    pass


class RPC:
    def __init__(self, command):
        self.process = subprocess.Popen([command, 'app-server'], stdin=subprocess.PIPE,
                                        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
        self.pending, self.counter = {}, 0
        self.lock, self.events = threading.Lock(), queue.Queue()
        threading.Thread(target=self.receive, daemon=True).start()
        try:
            self.call('initialize', dict(clientInfo=dict(name='linux-agent', version='0.1.0'),
                                         capabilities=dict(experimentalApi=True)))
            self.write(dict(method='initialized'))
        except Exception:
            self.close()
            raise

    def write(self, message):
        with self.lock:
            self.process.stdin.write(json.dumps(message) + '\n')
            self.process.stdin.flush()

    def receive(self):
        try:
            for line in self.process.stdout:
                message = json.loads(line)
                if 'method' not in message and 'id' in message:
                    waiter = self.pending.get(message['id'])
                    if waiter:
                        waiter.put(message)
                else:
                    self.events.put(message)
        finally:
            self.events.put(dict(disconnected=True))
            for waiter in list(self.pending.values()):
                waiter.put(dict(error=dict(message='Runtime disconnected')))

    def call(self, method, params):
        self.counter += 1
        identifier = self.counter
        waiter = self.pending[identifier] = queue.Queue()
        try:
            self.write(dict(id=identifier, method=method, params=params))
            result = waiter.get(timeout=40)
            if 'error' in result:
                raise RPCError('Runtime request rejected')
            return result['result']
        finally:
            self.pending.pop(identifier, None)

    def close(self):
        self.process.terminate()
        try:
            self.process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait()
