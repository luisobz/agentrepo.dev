# Feature 08: Skills Admin UI

## Meta
- **Número:** 08
- **Fase:** Fase 2 — Home y Skills
- **Objetivo detallado:** Proveer una interfaz administrativa para crear, editar, publicar y eliminar Skills. Dado que el contenido de una Skill es Markdown crudo, se requiere un editor de código avanzado (Monaco Editor o equivalente) para asegurar una experiencia de autoría técnica y fluida.

## Alcance
- **Incluye:**
  - Layout básico para `apps/admin` y configuración inicial de Auth.js (opcionalmente mockeado si el setup de credenciales es complejo).
  - Listado (Tabla o Grid) de Skills existentes consumiendo el tRPC endpoint.
  - Formulario de creación/edición de una Skill (título, slug, tipo, estado).
  - Integración del editor Monaco (componente react) para el contenido Markdown.
- **NO incluye:**
  - Panel de administración para Agents o Blog (Features posteriores).

## Criterios de Aceptación
1. La aplicación `/admin` está protegida (requiere login o un check básico).
2. El administrador puede ver todas las Skills creadas en la base de datos.
3. Se puede crear una nueva Skill; el título autogenera un `slug` si es posible, y se guarda en la base de datos a través de tRPC.
4. El editor de contenido permite escritura Markdown cruda con resaltado de sintaxis (Monaco).

## Dependencias
- Requiere **Feature 07** (Skills Backend & tRPC).

## Componentes del sistema implicados
- `apps/admin/src/app`
- Componentes de UI (`Table`, `Input`, `Select`, `Button` de `@agentrepo/ui`).
- Dependencia npm para el editor (ej. `@monaco-editor/react`).

## Lista de Tasks
1. `task-1-admin-layout-auth.md`: Layout base y auth placeholder.
2. `task-2-skills-admin-list.md`: Listado de tabla CRUD.
3. `task-3-skills-admin-form.md`: Formulario de datos básicos.
4. `task-4-monaco-editor-integration.md`: Editor de código.
