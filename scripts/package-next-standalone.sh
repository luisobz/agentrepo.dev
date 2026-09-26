#!/usr/bin/env bash
set -euo pipefail

app="$1"
destination="$2"

mkdir -p "$destination/apps/$app/.next" "$destination/node_modules"
rsync -a "apps/$app/.next/standalone/" "$destination/"
rsync -a "apps/$app/.next/static/" "$destination/apps/$app/.next/static/"
rsync -a "apps/$app/public/" "$destination/apps/$app/public/"

# Next's instrumentation loads these packages dynamically. Its standalone
# tracer does not include them, which makes Passenger fail at runtime.
for dependency in debug ms module-details-from-path; do
  cp -aL "node_modules/.pnpm/node_modules/$dependency" \
    "$destination/node_modules/$dependency"
done
