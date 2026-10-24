#!/usr/bin/env bash
set -euo pipefail

# Match the deploy jobs so lockfile pruning failures stop before production work.
for application in backend-web backend-ai; do
  pnpm exec nx run "$application:prune"
  bundle_directory="apps/$application/dist"
  node scripts/prepare-backend-bundle.mjs "$bundle_directory"
  pnpm --dir "$bundle_directory" install --prod --frozen-lockfile
  pnpm --dir "$bundle_directory/workspace_modules/@agentrepo/database" exec prisma generate --schema prisma/schema.prisma
  node scripts/fix-pruned-workspace-entries.mjs "$bundle_directory"
done
