"""Bot-owned routing database. The model cannot create owner authorizations."""
from contextlib import contextmanager
import re
import sqlite3
import time
from settings import STATE, environment
from telegram import api, send


@contextmanager
def connection():
    db = sqlite3.connect(STATE / 'sessions.sqlite3', timeout=15)
    db.row_factory = sqlite3.Row
    db.executescript('''CREATE TABLE IF NOT EXISTS sessions(thread TEXT PRIMARY KEY, topic INTEGER UNIQUE, title TEXT);
    CREATE TABLE IF NOT EXISTS inbox(id INTEGER PRIMARY KEY, thread TEXT, text TEXT, delivered INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS outbox(key TEXT PRIMARY KEY, created REAL);''')
    try:
        with db:
            yield db
    finally:
        db.close()


def valid_thread(thread):
    if not isinstance(thread, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', thread):
        raise ValueError('Invalid thread')


def register(thread, title):
    valid_thread(thread)
    with connection() as db:
        row = db.execute('SELECT topic FROM sessions WHERE thread=?', (thread,)).fetchone()
        if row:
            return row['topic']
        topic = api('createForumTopic', dict(chat_id=int(environment()['TELEGRAM_OWNER_ID']),
                                            name=str(title or 'Server agent')[:100]))['message_thread_id']
        db.execute('INSERT INTO sessions VALUES(?,?,?)', (thread, topic, str(title)[:100]))
        return topic


def enqueue(topic, text):
    with connection() as db:
        row = db.execute('SELECT thread FROM sessions WHERE topic=?', (topic,)).fetchone()
        if not row:
            return False
        count = db.execute('SELECT count(*) FROM inbox WHERE delivered=0').fetchone()[0]
        if count >= 100:
            raise ValueError('Agent queue full')
        db.execute('INSERT INTO inbox(thread,text) VALUES(?,?)', (row['thread'], text[:16000]))
        return True


def dispatch(request):
    operation = request.get('op')
    if operation == 'register':
        return register(request.get('thread'), request.get('title'))
    if operation == 'poll':
        with connection() as db:
            return [dict(row) for row in db.execute('SELECT id,thread,text FROM inbox WHERE delivered=0 ORDER BY id LIMIT 20')]
    if operation == 'ack':
        with connection() as db:
            db.execute('UPDATE inbox SET delivered=1 WHERE id=?', (int(request['id']),))
            db.execute('DELETE FROM inbox WHERE delivered=1 AND id < (SELECT max(id)-3000 FROM inbox)')
        return True
    if operation == 'publish':
        thread, key = request.get('thread'), str(request.get('key', ''))[:200]
        valid_thread(thread)
        with connection() as db:
            row = db.execute('SELECT topic FROM sessions WHERE thread=?', (thread,)).fetchone()
            if not row or not key:
                raise ValueError('Session not registered')
            if not db.execute('SELECT 1 FROM outbox WHERE key=?', (key,)).fetchone():
                send(str(request.get('text', ''))[:24000], row['topic'])
                db.execute('INSERT INTO outbox VALUES(?,?)', (key, time.time()))
                db.execute('DELETE FROM outbox WHERE created<?', (time.time() - 604800,))
        return True
    raise ValueError('Relay operation not allowed')
