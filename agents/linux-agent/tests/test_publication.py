"""Public sources must contain generic examples and no deployment state."""
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class PublicationTests(unittest.TestCase):
    def test_no_private_deployment_data(self):
        forbidden = [r'panda' + r'house', r'luis' + r'obz',
                     r'/home/(?!example\b)[a-zA-Z0-9_-]+',
                     r'\b192\.168\.\d+\.\d+\b', r'\b10\.\d+\.\d+\.\d+\b',
                     r'-----BEGIN (?:OPENSSH|RSA|EC|PRIVATE).*KEY-----',
                     r'\b\d{8,12}:[A-Za-z0-9_-]{30,}\b',
                     r'\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}']
        for path in ROOT.rglob('*'):
            if not path.is_file() or '__pycache__' in path.parts:
                continue
            self.assertFalse(path.is_symlink(), path.relative_to(ROOT))
            self.assertNotIn(path.suffix, ('.sqlite', '.db', '.log', '.pem', '.key'))
            content = path.read_text()
            for pattern in forbidden:
                self.assertIsNone(re.search(pattern, content, re.I),
                                  f'Private data pattern in {path.relative_to(ROOT)}')

    def test_credentials_are_empty(self):
        for line in (ROOT / 'examples/telegram.env.example').read_text().splitlines():
            if line and not line.startswith('#'):
                self.assertEqual(line.split('=', 1)[1], '')


if __name__ == '__main__':
    unittest.main()
