# Feature 07: Backend de Skills

## Meta
- **Número:** 07
- **Fase:** Fase 2 — Home y Skills
- **Objetivo detallado:** Implementar toda la lógica de backend para la entidad `Skill`. Una Skill es un fragmento de conocimiento atómico (Prompt, Template de configuración, Snippet) descrito en un fichero Markdown puro. Esta feature asienta las bases CRUD bajo la arquitectura hexagonal (Dominio, Infraestructura, Aplicación) y lo expone vía tRPC.

## Alcance
- **Incluye:**
  - Entidad de dominio `Skill` (ID, título, slug, tipo, contenido markdown, metadatos SEO).
  - Repositorio en Prisma (Create, Read, Update, Delete, List).
  - Casos de uso (Application layer) para gestionar el CRUD.
  - Endpoints en tRPC (`getSkills`, `getSkillBySlug`, `createSkill`, `updateSkill`, `deleteSkill`).
- **NO incluye:**
  - Sincronización bidireccional con GitHub. (Se asume persistencia directa en DB por ahora).
  - Componentes de UI (Frontend o Admin).

## Criterios de Aceptación
1. La base de datos tiene una tabla `Skill` que soporta texto Markdown largo.
2. Los tests unitarios de los Casos de Uso pasan.
3. Se puede consumir el CRUD completo desde la ruta tRPC (`trpc.skills.*`) desde el frontend.
4. Validaciones rígidas: El campo `slug` debe ser único, el `type` debe pertenecer a un enum (prompt, system, config, template).

## Dependencias
- Requiere **Feature 03** (Arquitectura Base Prisma/tRPC).

## Componentes del sistema implicados
- `packages/domain/src/skills`
- `packages/application/src/skills`
- `packages/infrastructure/src/persistence/prisma/repositories/skills.repository.ts`
- `packages/trpc/src/lib/routers/skills.ts`

## Lista de Tasks
1. `task-1-skills-domain-entities.md`: Entidad y puertos.
2. `task-2-skills-prisma-repository.md`: Esquema DB e implementación del repositorio.
3. `task-3-skills-use-cases.md`: Casos de uso (Application).
4. `task-4-skills-trpc-router.md`: Exposición vía tRPC.
