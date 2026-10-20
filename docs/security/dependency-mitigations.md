# Dependency mitigations

## braces: CVE-2026-93687

Upstream has no patched release for GHSA-vfj7-8cjw-p6xm. The project applies `patches/braces@3.0.3.patch` through pnpm to reject nesting beyond 128 levels before recursive compilation, expansion or stringification. The parser also bounds its brace/parenthesis stack. `tests/deployment/check-braces.mjs` covers ordinary patterns, deeply nested strings and programmatic ASTs; CI checks that the installed patch is effective.

The version-based advisory remains visible in dependency scanners. It must not be described as an upstream fix. Replace the local patch when a verified upstream release addresses the issue. The dependency is part of the development toolchain, not the production bundles.

## SWC compiler

Nx builds use `@swc/cli/bin/swc.js`. Its unused experimental `swcx` downloader dependency is excluded with a scoped pnpm override, removing the `got`/`http-cache-semantics` download chain. The experimental `swcx` command is not supported by this project. Normal SWC builds and deployable bundles are tested in CI.

## Database maintenance credentials

Postgres client passwords pass through an ephemeral process environment to Docker/libpq. They are excluded from the settings file, command arguments and diagnostic output. Non-secret connection settings are created with private permissions. Existing target checks, TLS verification and cleanup remain enforced.
