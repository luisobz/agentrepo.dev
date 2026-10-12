import unittest
from policy import authorized, duration, ConfirmationStore, transition

class PolicyTests(unittest.TestCase):
    def test_owner_and_private_chat_required(self):
        message = {'from': {'id': 42}, 'chat': {'id': 42, 'type': 'private'}}
        self.assertTrue(authorized(message, 42))
        for bad in [{'from': {'id': 7}}, {'chat': {'id': 7, 'type': 'private'}}, {'chat': {'id': 42, 'type': 'group'}}]:
            self.assertFalse(authorized({**message, **bad}, 42))

    def test_durations_bounded(self):
        self.assertEqual(duration('15m'), 900)
        self.assertEqual(duration('2h'), 7200)
        for bad in ['0', '9h', '-1', '15;id', '1s']:
            with self.assertRaises(ValueError): duration(bad)

    def test_confirmation_scoped_expiring_and_single_use(self):
        store = ConfirmationStore()
        token = store.create('root', 900, 42, 10, now=100)
        self.assertIsNone(store.consume(token, 42, 11, now=101))
        self.assertEqual(store.consume(token, 42, 10, now=101), ('root', 900))
        self.assertIsNone(store.consume(token, 42, 10, now=102))
        expired = store.create('root', 900, 42, 10, now=100)
        self.assertIsNone(store.consume(expired, 42, 10, now=1000))

    def test_alarm_delivery_failure_retries_and_recovery_is_delayed(self):
        state = {}
        self.assertIsNone(transition(state, True, 0, 60, 30))
        self.assertEqual(transition(state, True, 60, 60, 30), 'alert')
        self.assertEqual(transition(state, True, 61, 60, 30), 'alert')
        state['active'] = True  # commit only after successful delivery
        self.assertIsNone(transition(state, True, 62, 60, 30))
        self.assertIsNone(transition(state, False, 63, 60, 30))
        self.assertEqual(transition(state, False, 93, 60, 30), 'recovery')

if __name__ == '__main__': unittest.main()
