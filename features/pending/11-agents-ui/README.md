# Feature 11: Agents UI (Admin & Public)

## Meta
- **Número:** 11
- **Fase:** Fase 3 — Agents y Blog
- **Objetivo detallado:** Construir las interfaces para interactuar con los agentes. En admin para poder dar de alta un agente y manejar su JSON/FileTree, y en público para presentar el agente al estilo IDE (barra lateral de ficheros, sistema de pestañas y área principal).

## Alcance
- **Incluye:**
  - Panel Admin de listado y edición de Agentes.
  - Listado público de `/agents`.
  - Página dinámica `/agents/[slug]` con layout tipo IDE.
  - Componente iterativo de Árbol de Directorios.
- **NO incluye:**
  - Integración real del Playground visual (Features 16).

## Dependencias
- Requiere **Feature 10** (Agents Backend).

## Lista de Tasks
1. `task-1-agents-admin-management.md`: Formularios admin.
2. `task-2-agents-list-page.md`: Listado público cards.
3. `task-3-agents-ide-layout.md`: Layout base IDE (Sidebar y Main).
4. `task-4-agents-file-tree-tabs.md`: Componente de árbol y gestor de estado de pestañas.
