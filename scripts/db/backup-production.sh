#!/usr/bin/env bash
set -euo pipefail

: "${PROD_MIGRATION_DATABASE_URL:?Production migration URL is required}"
: "${PROD_PROJECT_REF:?Production project ref is required}"
: "${BACKUP_PASSPHRASE:?Backup encryption passphrase is required}"

python3 scripts/db/validate-targets.py
export DB_WORK_DIR="${RUNNER_TEMP:-/tmp}/agentrepo-backup-${GITHUB_RUN_ID:-manual}"
mkdir -p "$DB_WORK_DIR"
chmod 700 "$DB_WORK_DIR"
cp /tmp/supabase-ca.crt "$DB_WORK_DIR/ca.crt"
trap 'rm -f "$DB_WORK_DIR/prod.dump"' EXIT

export DATABASE_URL="$PROD_MIGRATION_DATABASE_URL"
python3 scripts/db/db-url-to-env.py
scripts/db/postgres-client.sh pg_dump \
  --format=custom --no-owner --no-acl \
  --file=/backup/prod.dump
scripts/db/postgres-client.sh pg_restore --list /backup/prod.dump >/dev/null
test -s "$DB_WORK_DIR/prod.dump"

printf '%s' "$BACKUP_PASSPHRASE" | gpg --batch --yes --pinentry-mode loopback \
  --passphrase-fd 0 --symmetric --cipher-algo AES256 \
  --output "$DB_WORK_DIR/prod.dump.gpg" "$DB_WORK_DIR/prod.dump"
sha256sum "$DB_WORK_DIR/prod.dump.gpg" > "$DB_WORK_DIR/prod.dump.gpg.sha256"
test -s "$DB_WORK_DIR/prod.dump.gpg"
echo "Encrypted production backup ready"
