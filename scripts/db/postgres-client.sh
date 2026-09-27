#!/usr/bin/env bash
set -euo pipefail

# Use a client that matches the production PostgreSQL major version.
# libpq reads credentials from an ephemeral env file, never process arguments.
exec docker run --rm --network host \
  --user "$(id -u):$(id -g)" \
  --volume "${DB_WORK_DIR:?DB_WORK_DIR is required}:/backup" \
  --env-file "$DB_WORK_DIR/db.env" \
  postgres:17 "$@"
