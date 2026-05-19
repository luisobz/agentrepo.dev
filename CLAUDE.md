# CLAUDE.md – AgentRepo.dev Monorepo

> _CRITICAL: ALWAYS read AGENTS.md and AGENTS_LOCAL.md at the root of this repository before starting any task._

## Core Principles

1. Preserve build + test green status.
2. Minimise surface of change; refactor opportunistically (scout rule).
3. Keep architectural boundaries: controllers thin, domain logic in services/repositories,
   shared utilities in packages.
4. Maintain consistency with existing patterns (naming, imports, error handling, logging, config).
5. Prefer clarity and correctness over premature optimisation.

## Monorepo Map (Condensed)

**Hierarchical Context Strategy:** To understand a specific app or package,
ALWAYS read its "Greeting Window" (`README.md`) first. This avoids scraping unnecessary code.

- **apps/**
  - `admin`: Next.js Admin panel. [Read more](apps/admin/README.md)
  - `backend-ai`: NestJS API for AI Workflows. [Read more](apps/backend-ai/README.md)
  - `backend-web`: NestJS Main API and tRPC router. [Read more](apps/backend-web/README.md)
  - `web`: Next.js Public Web App. [Read more](apps/web/README.md)
- **packages/**
  - `application`: Use cases and ports for Hexagonal Architecture. [Read more](packages/application/README.md)
  - `config`: Shared configuration and tokens. [Read more](packages/config/README.md)
  - `domain`: Pure business logic entities and types. [Read more](packages/domain/README.md)
  - `infrastructure`: Prisma DB, external adapters, and implementations. [Read more](packages/infrastructure/README.md)
  - `trpc`: Shared tRPC routers and schemas. [Read more](packages/trpc/README.md)
  - `ui`: Shared design system components (shadcn) and tailwind config. [Read more](packages/ui/README.md)

## Tooling & Standards

- Node 26.1.0, pnpm 10.33.4, nx tasks.
- Test runner: vitest — `test` for unit, `test:int` for integration.
- Formatting: Prettier. Never manually reorder imports.
- Lint: ESLint.
- Commits: Conventional commits (feat, fix, refactor, chore, docs, test, perf, build, ci).

## Error & Logging Patterns

- Throw domain/custom error classes; map them in centralised API error-handler plugins.
- Avoid leaking internals or stack traces to clients; log sanitised context.
- Use the built-in `@nestjs/common` Logger in backends.

## Database & Migrations

- All schema changes through Prisma migrations.
- Never manually edit the generated client output.
- After any schema change: regenerate client (`pnpm db:generate`), update seeds and tests.

## Performance & Safety Guidelines

- Avoid N+1 query patterns; leverage relations or batching.
- Paginate list endpoints.
- Validate and sanitise all external inputs.

## Testing Expectations

- Bug fix: write a failing test first when feasible.
- New feature: add unit coverage + update integration tests if endpoint/DB contract changes.

## Response Style

- Concise, direct, implementation-focused.
- Bullet lists for multi-step plans.
- Provide diffs or file targets rather than verbose prose when changing code.
