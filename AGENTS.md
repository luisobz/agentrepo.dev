# AGENTS.md — AI Memory & Quality Checklist

> _CRITICAL: ALWAYS read CLAUDE.md for global architecture and AGENTS_LOCAL.md for local environment constraints before starting any task._

This file is the living memory of AI agents working in this repository.
It records mandatory rules derived from code reviews to prevent repeating past mistakes.
**Read this file before starting any task.**

## Quality Checklist

- **Secrets:** Never hardcode secrets, private keys, or credentials.
  Always load them from environment variables via `process.env` o Config module.

- **Error Handling:** Never throw raw `Error`.
  Always use domain/custom error classes and map them in centralised handlers.

- **Database:** Never edit the generated ORM client directly.
  All schema changes must go through Prisma migrations (`pnpm db:migrate`).

- **Logging:** Never introduce new logging libraries.
  Use the existing NestJS `Logger` from `@nestjs/common`.

- **Type Safety:** Avoid unannotated `any` or casting to sidestep the type system.
  Use explicit type guards.

- **Imports:** Never manually reorder imports; let the formatter/sort-plugin handle it.

- **Architecture:** Keep controllers thin. Do not mix controller logic with
  persistence or external service calls. Move domain logic to `packages/application` and `packages/domain`.

- **Module Dependencies:** Never import `@agentrepo/application` or `@agentrepo/infrastructure` from inside `@agentrepo/domain`. Follow the strict Hexagonal rules defined in `eslint.config.mjs`.

- **Command output:** Run commands with intelligence. If a command produces verbose
  output, suppress or filter it — never dump raw output into context. For builds,
  tests, migrations, or any long-running command: if you already know the signal
  (e.g. `ERR`, `FAIL`, `error TS`), use `grep` for it and `head`/`tail` for context
  lines around the match. For exploratory commands (`find`, `cat`, `ls`), cap the
  output if you don't need it in full. For test runs, skip coverage output — what
  matters is pass/fail and, on failure, the specific error.

- **Clean Code:** Always read and follow the conventions in `skills/clean-code.md` when developing — never  bypass the structural and code quality guidelines outlined there.

<!-- Add project-specific rules below as they emerge from code reviews. -->
<!-- Format: "- **<Topic>:** <what to do> — never <what to avoid>." -->


