# Feature 06: Global Search System (Postgres FTS)

## Meta
- **Número:** 06
- **Fase:** Fase 2 — Home y Skills
- **Objetivo detallado:** Implementar el motor de búsqueda global estilo Raycast que permite a los usuarios encontrar Skills, Agents y posts de Blog desde el frontend. Requiere configuración backend para la indexación y búsqueda Full-Text Search (FTS) en Postgres/Supabase y la UI correspondiente.

## Alcance
- **Incluye:**
  - Migración Prisma para habilitar FTS o indexación básica de texto.
  - Creación del dominio y casos de uso de Búsqueda (`packages/domain`, `packages/application`).
  - Endpoint de tRPC para consultar la búsqueda general devolviendo resultados agrupados o rankeados.
  - Componente frontend (Modal tipo Command Palette) para la búsqueda.
- **NO incluye:**
  - Indexación de documentos PDF o archivos complejos (sólo metadatos y texto raw de los repositorios).
  - Integración de RAG IA (Búsqueda vectorial), por ahora es pura búsqueda SQL Full-Text.

## Criterios de Aceptación
1. Una llamada tRPC `trpc.search.global({ query: 'nest' })` devuelve resultados estructurados desde el backend.
2. Hacer click en el input de búsqueda de la Home o pulsar `Cmd+K` abre la Command Palette central.
3. El usuario puede escribir, el sistema hace debounce y la Command Palette muestra resultados relevantes instantáneamente.
4. Navegación por los resultados usando el teclado (flechas arriba/abajo y Enter).

## Dependencias
- Requiere **Feature 02** (Inputs/Componentes).
- Requiere **Feature 03** (Base Prisma y tRPC).
- Requiere **Feature 05** (Home input trigger).

## Componentes del sistema implicados
- `packages/domain` (Search result entity/interface).
- `packages/infrastructure` (Prisma Search repository).
- `apps/backend-web` (TRPC Search router).
- `apps/web/src/components/search` (Command Palette UI).

## Reglas de Negocio Relevantes
- La velocidad es crítica. Debe parecer instantáneo.
- FTS de Postgres es la restricción técnica para no añadir dependencias como Algolia.
- Los resultados deben mostrar el Tipo de recurso (Skill, Agent, Blog) con el componente `TypeChip`.

## Consideraciones Técnicas
- Prisma soporta `search` operations usando índices FTS en PostgreSQL (requiere configuración `previewFeatures = ["fullTextSearch"]` o `fullTextSearchPostgres` si es v5+).
- En el frontend, el componente ideal para esto es `cmdk` (ya incluido en la variante `Command` de shadcn/ui).

## Lista de Tasks
1. `task-1-search-domain-infra.md`: Repositorios y entidades para FTS.
2. `task-2-search-trpc-endpoint.md`: Router y Casos de Uso.
3. `task-3-search-ui-component.md`: Frontend Command Palette.
