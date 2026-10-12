import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import bot
import sessions
from control import unit_for
from maintenance import command_for
from monitor import evaluate


class SecurityTests(unittest.TestCase):
    def test_control_rejects_command_injection_and_invalid_duration(self):
        for request in [dict(action='shell', value='id'), dict(action='root', value=0),
                        dict(action='root', value=True), dict(action='root', value='900;id'),
                        dict(action='apt-upgrade', value='extra')]:
            with self.assertRaises(ValueError): unit_for(request)
        self.assertEqual(unit_for(dict(action='root', value=900)), 'linux-agent-root-enable@900.service')
        with patch('control.configuration', return_value={'services': ['example.service']}):
            self.assertEqual(unit_for(dict(action='restart', value='example.service')), 'linux-agent-maintenance@restart--example.service.service')
            with self.assertRaises(ValueError): unit_for(dict(action='restart', value='other.service'))
            with self.assertRaises(ValueError): unit_for(dict(action='restart', value='example.service;id'))

    def test_maintenance_never_accepts_shell_and_limits_service_names(self):
        config = {'services': ['example.service']}
        self.assertEqual(command_for('restart--example.service', config), ['/usr/bin/systemctl', 'restart', 'example.service'])
        for action in ['id', 'apt-upgrade;id', 'restart--other.service']:
            with self.assertRaises(ValueError): command_for(action, config)

    def test_model_relay_cannot_enqueue_or_open_root(self):
        for action in ['root', 'revoke', 'enqueue', 'control', 'shell']:
            with self.assertRaises(ValueError): sessions.dispatch({'op': action})

    def test_bot_rejects_unauthorized_messages_before_any_io(self):
        instance = object.__new__(bot.Bot)
        instance.owner = 42
        with patch('bot.send') as send, patch('bot.enqueue') as enqueue:
            instance.message({'from': {'id': 7}, 'chat': {'id': 42, 'type': 'private'}, 'text': '/root 8h'})
            send.assert_not_called()
            enqueue.assert_not_called()

    def test_monitor_alert_dedup_delivery_retry_and_recovery(self):
        state, emitted = {}, []
        config = dict(alert_seconds=60, clear_seconds=30)
        emit = lambda text: emitted.append(text) or True
        evaluate(state, {'ram': 95}, 0, emit, config)
        evaluate(state, {'ram': 95}, 60, emit, config)
        evaluate(state, {'ram': 95}, 61, emit, config)
        self.assertEqual(len(emitted), 1)
        evaluate(state, {'ram': 82}, 62, emit, config)
        evaluate(state, {'ram': 82}, 92, emit, config)
        self.assertEqual(len(emitted), 2)
        self.assertIn('RECOVERED', emitted[1])

    def test_session_routing_is_explicit_and_sql_is_parameterized(self):
        with tempfile.TemporaryDirectory() as root, patch('sessions.STATE', Path(root)):
            self.assertFalse(sessions.enqueue(99, '/root'))
            with sessions.connection() as db:
                db.execute('INSERT INTO sessions VALUES(?,?,?)', ('thread-1', 99, 'Demo'))
            self.assertTrue(sessions.enqueue(99, "quote'; DROP TABLE sessions;--"))
            messages = sessions.dispatch({'op': 'poll'})
            self.assertEqual(messages[0]['thread'], 'thread-1')
            sessions.dispatch({'op': 'ack', 'id': messages[0]['id']})
            self.assertEqual(sessions.dispatch({'op': 'poll'}), [])

if __name__ == '__main__': unittest.main()
