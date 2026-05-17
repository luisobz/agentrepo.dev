# Package Dependencies

## Stack principal

| Tool | Uso |
|---|---|
| Nx | Orquestación monorepo |
| SWC | Transpilación TypeScript |
| Vitest | Testing |
| ESLint | Linting |
| Next.js | Frontend |
| NestJS | Backend |
| TypeScript | Lenguaje base |

---

# Dependencias

## Core Monorepo

Estas dependencias son comunes a todo el monorepo.

| Dependencia | Uso |
|---|---|
| `nx` | Core Nx |
| `@nx/js` | Librerías TypeScript |
| `@nx/node` | Aplicaciones backend Node |
| `typescript` | TypeScript compiler y typecheck |

---

## Frontend (Next.js)

Dependencias relacionadas con frontend React/Next.

| Dependencia | Uso |
|---|---|
| `@nx/next` | Integración Nx + Next.js |

---

## Backend (NestJS)

Dependencias relacionadas con backend NestJS.

| Dependencia | Uso |
|---|---|
| `@nx/nest` | Integración Nx + NestJS |
| `@nestjs/common` | Core decorators/providers |
| `@nestjs/core` | Runtime NestJS |
| `@nestjs/platform-express` | HTTP platform Express |
| `reflect-metadata` | Metadata decorators |
| `rxjs` | Reactive utilities internas Nest |

---

## Testing

Sistema de testing unificado del monorepo.

| Dependencia | Uso |
|---|---|
| `@nx/vitest` | Integración Nx + Vitest |
| `vitest` | Test runner |
| `vite` | Runtime/config requerido por Vitest |

---

## Linting

| Dependencia | Uso |
|---|---|
| `@nx/eslint` | Integración Nx + ESLint |
| `eslint` | Linter |

---

## Transpilación

SWC es el transpiler principal del monorepo.

| Dependencia | Uso |
|---|---|
| `@swc/core` | Core transpiler |
| `@swc/cli` | CLI SWC |
| `@swc/helpers` | Runtime helpers SWC |
| `unplugin-swc` | Integración SWC para Vitest/Vite |