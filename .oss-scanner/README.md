# OSS Scanner build environment

This configuration prepares the complete monorepo for Anthropic OSS Scanner.
It is independent of the production images and deployment pipeline.

```sh
docker build -f .oss-scanner/Dockerfile -t agentrepo-oss-scanner .
docker run --rm --network=none --cpus=2 --memory=8g agentrepo-oss-scanner \
  bash .oss-scanner/check.sh
```

The build installs Node.js 24.13.0 from a digest-pinned official image,
pnpm 10.33.4, frozen-lockfile dependencies, Prisma native engines, Chromium and
its system dependencies. It compiles every Nx build target, then runs the
verification script in a Docker build step with networking disabled. The final
image retains sources, generated clients, compiled applications, caches and test
fixtures; its default user is unprivileged. Test projects run serially with at
most two Vitest/Playwright workers to fit the scanner's two-CPU runtime. Anthropic adds its own tools/root
shell on top, as documented by its checker.

A Dockerfile-specific ignore file retains documentation and fixtures otherwise
hidden by the production `.dockerignore`, while excluding local environments,
credentials, generated output and seed data. Build from a clean checkout. Never
mount a home directory, credential store or Docker socket into the image.

No live service credentials are needed. The dummy database URL is only for Prisma
configuration; no migration or production seed runs. PostgreSQL is available for
optional local reproductions. External identity/AI/email integrations use mocks
in tests. Offline tests include the CLI, authorization/session logic, uploads,
Markdown projections and local desktop/mobile UI fixtures; provider integration
and database policy behavior require separate synthetic integration scenarios.
Existing explicitly skipped tests remain skipped; this setup does not alter them.

An offline rebuild is also possible after preparation:

```sh
docker run --rm --network=none --cpus=2 --memory=8g agentrepo-oss-scanner \
  pnpm exec nx run-many --target=build --all --parallel=2 --skip-nx-cache
```

For enrollment, use the official `templates/project.yaml` and run
`python tools/validate.py` and `tools/check agentrepo-dev` in Anthropic's
`oss-scanner` repository. Its checker clones the configured branch anonymously:
referenced files must exist on that branch. Do not claim a default-branch check
has passed when only a feature-branch configuration was tested. The project PR
requires human review/merge; enrollment requires the maintainer's public contact,
program-terms acceptance and personal CLA signature.
