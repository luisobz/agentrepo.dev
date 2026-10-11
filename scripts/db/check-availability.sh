#!/usr/bin/env bash
set -euo pipefail

# Reuse the existing maintenance credentials, with every query forced read-only.
: "${DATABASE_URL:?Database URL is required}"
: "${PROJECT_REF:?Project ref is required}"
export PROD_MIGRATION_DATABASE_URL="$DATABASE_URL"
export PROD_PROJECT_REF="$PROJECT_REF"
unset PRE_MIGRATION_DATABASE_URL
python3 scripts/db/validate-targets.py

export DB_WORK_DIR
DB_WORK_DIR=$(mktemp -d "${RUNNER_TEMP:-/tmp}/agentrepo-availability.XXXXXX")
chmod 700 "$DB_WORK_DIR"
trap 'rm -rf "$DB_WORK_DIR"' EXIT
curl --fail --silent --show-error --location --max-time 30 \
  https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt \
  --output "$DB_WORK_DIR/ca.crt"
python3 scripts/db/db-url-to-env.py
printf '%s\n' 'PGCONNECT_TIMEOUT=15' 'PGOPTIONS=-c default_transaction_read_only=on -c statement_timeout=10000' >> "$DB_WORK_DIR/db.env"

for attempt in 1 2 3; do
  if scripts/db/postgres-client.sh psql -X -qAt --set=ON_ERROR_STOP=1 \
    --command='BEGIN READ ONLY; SELECT CASE WHEN count(*) > 0 AND count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL) = 0 THEN 1 ELSE 0 END FROM public._prisma_migrations; COMMIT;' \
    > "$DB_WORK_DIR/result" 2> "$DB_WORK_DIR/error"; then
    if grep -Fxq '1' "$DB_WORK_DIR/result"; then
      echo 'Database reachable; migration history healthy; read-only query completed'
      exit 0
    fi
    echo '::error::Database migration history is missing or has an unfinished migration'
    exit 1
  fi
  echo "Database availability attempt $attempt failed"
  if [ "$attempt" -lt 3 ]; then sleep 2; fi
done
echo '::error::Database unavailable after three attempts; inspect Supabase project status and credentials'
exit 1
