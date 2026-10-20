#!/usr/bin/env python3
"""Pass the database password through the process environment, never disk or argv."""
import os
import sys
from urllib.parse import unquote, urlparse

url = urlparse(os.environ['DATABASE_URL'])
if url.scheme not in ('postgres', 'postgresql') or not url.hostname:
    sys.exit('Invalid database URL')
password = unquote(url.password or '')
if '\n' in password or '\r' in password:
    sys.exit('Newlines are not supported in database credentials')
environment = dict(os.environ)
environment.pop('DATABASE_URL', None)
environment['PGPASSWORD'] = password
work = os.environ['DB_WORK_DIR']
arguments = ['docker', 'run', '--rm', '--network', 'host', '--user', str(os.getuid())+':'+str(os.getgid()), '--volume', work+':/backup', '--env-file', work+'/db.env', '--env', 'PGPASSWORD', 'postgres:17'] + sys.argv[1:]
os.execvpe('docker', arguments, environment)
