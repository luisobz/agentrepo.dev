"""Exact, stdin-only sudo entry point running as the bot account, never root."""
import json
import sys
from sessions import dispatch


def main():
    if len(sys.argv) != 1:
        raise SystemExit(2)
    while True:
        line = sys.stdin.buffer.readline(65537)
        if not line:
            return
        if len(line) > 65536:
            raise SystemExit(2)
        try:
            result = dispatch(json.loads(line))
            response = {'ok': True, 'result': result}
        except Exception:
            response = {'ok': False, 'error': 'Invalid or unavailable relay operation'}
        print(json.dumps(response), flush=True)


if __name__ == '__main__':
    main()
