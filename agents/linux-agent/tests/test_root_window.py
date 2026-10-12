import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import root_window


class RootWindowTests(unittest.TestCase):
    def test_timer_failure_removes_new_rule_and_expiry(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            rule, expiry = root / 'sudoers', root / 'expiry'
            def run(command, **kwargs):
                if command[1:2] == ['restart']:
                    raise subprocess.CalledProcessError(1, command)
                return subprocess.CompletedProcess(command, 0)
            with patch.multiple(root_window, SUDOERS=rule, EXPIRY=expiry, TIMER_OVERRIDE=root / 'timer/window.conf'), patch('root_window.subprocess.run', side_effect=run):
                with self.assertRaises(subprocess.CalledProcessError): root_window.enable(60)
                self.assertFalse(rule.exists())
                self.assertFalse(expiry.exists())
                self.assertFalse((root / 'sudoers.tmp').exists())

    def test_invalid_duration_never_executes_privileged_commands(self):
        with patch('root_window.subprocess.run') as run:
            for value in (0, 59, 28801):
                with self.assertRaises(ValueError): root_window.enable(value)
            run.assert_not_called()


if __name__ == '__main__': unittest.main()
