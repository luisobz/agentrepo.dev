# Feature 03: Fundación de Arquitectura Base

## Meta
- **Número:** 03
- **Fase:** Fase 1 — Fundación visual y estructural
- **Objetivo detallado:** Establecer la base de la arquitectura hexagonal, configurar Prisma con PostgreSQL (Supabase) y proveer la infraestructura de tRPC necesaria para que el frontend (`web`, `admin`) pueda comunicarse con el `backend-web`.

## Alcance
- **Incluye:**
  - Definición del esquema básico de Prisma y primera migración.
  - Creación de los módulos NestJS esenciales en `apps/backend-web`.
  - Configuración del router global de tRPC en el paquete `@agentrepo/trpc`.
  - Configuración de los providers en el frontend (React Query + tRPC).
  - Integración del adaptador Prisma en NestJS (`packages/infrastructure`).
- **NO incluye:**
  - Desarrollo de funcionalidades CRUD específicas de Skills o Agents.
  - Configuración del flujo REST hacia `backend-ai`.
  - Configuración de Auth (Auth.js) para las rutas protegidas.

## Criterios de Aceptación
1. Existe un `schema.prisma` inicial con una configuración de Supabase PostgreSQL funcional.
2. Un endpoint de "hello world" en tRPC es consumido exitosamente desde `apps/web`.
3. Los paquetes `domain`, `application`, e `infrastructure` cuentan con una estructura base clara exportable (`index.ts`).
4. Las reglas de `nx/enforce-module-boundaries` de Nx garantizan que `domain` no puede importar nada externo.

## Dependencias
- Ninguna.

## Componentes del sistema implicados
- `prisma/schema.prisma`.
- `packages/trpc`.
- `apps/backend-web`.
- `apps/web`.
- `packages/infrastructure`.

## Reglas de Negocio Relevantes
- Todo el tipado entre Frontend y Backend será strict end-to-end usando tRPC.
- Prisma se instancia solo en `packages/infrastructure` y es inyectado mediante tokens/puertos a la capa de aplicación o directo a la capa NestJS donde sea oportuno (según la implementación).

## Consideraciones Técnicas
- El proyecto usará `pnpm` y los workspaces de Nx.
- Hay que verificar que el setup de `@trpc/server` con el adaptador Fastify/Express de NestJS funciona fluidamente.
- El cliente tRPC en el frontend Next.js 16 (App Router) requerirá el setup correcto de Server Components (si aplica) o React Query wrapper (`@trpc/react-query`) para Client Components.

## Lista de Tasks
1. `task-1-prisma-schema-setup.md`: Base del esquema de BBDD.
2. `task-2-domain-application-core.md`: Definición y testeo de restricciones arquitectónicas.
3. `task-3-trpc-backend-setup.md`: Router de tRPC en NestJS.
4. `task-4-trpc-frontend-provider.md`: Provider de tRPC en React.
