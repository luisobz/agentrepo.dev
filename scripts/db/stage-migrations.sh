#!/usr/bin/env bash
set -euo pipefail

: "${PROD_MIGRATION_DATABASE_URL:?Production migration URL is required}"
: "${PRE_MIGRATION_DATABASE_URL:?Preproduction migration URL is required}"
: "${PROD_PROJECT_REF:?Production project ref is required}"
: "${PRE_PROJECT_REF:?Preproduction project ref is required}"

python3 scripts/db/validate-targets.py
export DB_WORK_DIR="${RUNNER_TEMP:-/tmp}/agentrepo-stage-${GITHUB_RUN_ID:-manual}"
mkdir -p "$DB_WORK_DIR"
chmod 700 "$DB_WORK_DIR"
cp /tmp/supabase-ca.crt "$DB_WORK_DIR/ca.crt"
trap 'rm -rf "$DB_WORK_DIR"' EXIT

# The public schema contains the application data and Prisma migration ledger.
# Supabase-managed auth/storage schemas remain owned by the preproduction project.
export DATABASE_URL="$PROD_MIGRATION_DATABASE_URL"
python3 scripts/db/db-url-to-env.py
scripts/db/postgres-client.sh pg_dump \
  --schema=public --format=custom \
  --no-owner --no-acl --file=/backup/public.dump
scripts/db/postgres-client.sh pg_restore --list /backup/public.dump >/dev/null

export DATABASE_URL="$PRE_MIGRATION_DATABASE_URL"
python3 scripts/db/db-url-to-env.py
# Extensions are omitted from a schema-scoped dump but its indexes depend on pg_trgm.
scripts/db/postgres-client.sh psql -v ON_ERROR_STOP=1 -c \
  'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public' >/dev/null
# pg_restore's DROP TRIGGER ... ON table fails if the target schema is empty.
# Only request cleanup after an earlier rehearsal has populated it.
restore_options=()
if [[ "$(scripts/db/postgres-client.sh psql -Atqc "SELECT to_regclass('public.\"Skill\"') IS NOT NULL")" == t ]]; then
  restore_options=(--clean --if-exists)
fi
scripts/db/postgres-client.sh pg_restore \
  --dbname=postgres \
  --schema=public "${restore_options[@]}" \
  --no-owner --no-acl --exit-on-error --single-transaction \
  /backup/public.dump

# Prisma must execute the exact same pending migrations on the production clone.
DATABASE_URL="$PRE_MIGRATION_DATABASE_URL" pnpm db:migrate:deploy
DATABASE_URL="$PRE_MIGRATION_DATABASE_URL" pnpm prisma migrate status \
  --config=packages/database/prisma.config.ts
echo "Migration rehearsal passed"
