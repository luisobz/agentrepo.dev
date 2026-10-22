#!/usr/bin/env bash
# Run from /src in the prepared scanner image, including with --network=none.
set -euo pipefail
cd "$(dirname "$0")/.."

# Match the scanner's two-CPU runtime without dropping test coverage.
export VITEST_MAX_WORKERS=2

# Recompute rather than accepting build-time Nx task-cache results.
pnpm exec nx run database:generate --skip-nx-cache
pnpm exec nx run-many --targets=lint,test --all --parallel=1 --skip-nx-cache
python3 tests/deployment/check-gates.py
python3 tests/deployment/check-launch-runtime.py
python3 tests/deployment/check-db-credentials.py
python3 tests/deployment/check-availability.py
node tests/deployment/check-braces.mjs
pnpm exec playwright test --workers=2
