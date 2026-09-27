#!/usr/bin/env python3
"""Write libpq environment variables without putting a DB password in argv."""

import os
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

url = urlparse(os.environ["DATABASE_URL"])
if url.scheme not in ("postgres", "postgresql") or not url.hostname:
    sys.exit("Invalid database URL")

values = {
    "PGHOST": url.hostname,
    "PGPORT": str(url.port or 5432),
    "PGUSER": unquote(url.username or ""),
    "PGPASSWORD": unquote(url.password or ""),
    "PGDATABASE": url.path.lstrip("/"),
    "PGSSLMODE": "verify-full",
    "PGSSLROOTCERT": "/backup/ca.crt",
}
if any("\n" in value or "\r" in value for value in values.values()):
    sys.exit("Newlines are not supported in database credentials")
output = Path(os.environ["DB_WORK_DIR"]) / "db.env"
output.write_text("".join(f"{key}={value}\n" for key, value in values.items()))
output.chmod(0o600)
