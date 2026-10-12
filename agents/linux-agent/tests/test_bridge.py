import queue
import unittest
from unittest.mock import Mock, patch
from bridge import Bridge


class BridgeTests(unittest.TestCase):
    def bridge(self):
        instance = object.__new__(Bridge)
        instance.rpc = Mock()
        instance.rpc.events = queue.Queue()
        instance.relay = Mock()
        instance.threads = {'session-a', 'session-b'}
        instance.approvals = {}
        return instance

    def test_approval_cannot_cross_session_and_is_single_use(self):
        bridge = self.bridge()
        bridge.approvals['token'] = dict(id=12, thread='session-a', expires=200)
        with patch('bridge.time.time', return_value=100):
            bridge.deliver('session-b', '/approve token')
            bridge.rpc.write.assert_not_called()
            bridge.deliver('session-a', '/approve token')
            bridge.rpc.write.assert_called_once_with(dict(id=12, result=dict(decision='accept')))
            bridge.deliver('session-a', '/approve token')
            self.assertEqual(bridge.rpc.write.call_count, 1)

    def test_expired_approval_is_declined_even_without_owner_response(self):
        bridge = self.bridge()
        bridge.approvals['token'] = dict(id=12, thread='session-a', expires=99)
        with patch('bridge.time.time', return_value=100):
            bridge.events()
        bridge.rpc.write.assert_called_once_with(dict(id=12, result=dict(decision='decline')))
        self.assertEqual(bridge.approvals, {})

    def test_turn_routes_only_to_explicit_session(self):
        bridge = self.bridge()
        bridge.rpc.call.return_value = {'data': []}
        bridge.deliver('session-b', 'Review disk usage without changing anything')
        self.assertEqual(bridge.rpc.call.call_args.args[0], 'turn/start')
        self.assertEqual(bridge.rpc.call.call_args.args[1]['threadId'], 'session-b')
        with self.assertRaises(Exception): bridge.deliver('unknown', 'hello')

    def test_model_message_does_not_become_a_control_action(self):
        bridge = self.bridge()
        bridge.rpc.events.put(dict(method='item/completed', params=dict(threadId='session-a', item=dict(type='agentMessage', id='item', text='/root 8h'))))
        bridge.events()
        bridge.relay.call.assert_called_once_with('publish', thread='session-a', key='session-a:item', text='/root 8h')
        bridge.rpc.write.assert_not_called()


if __name__ == '__main__': unittest.main()
