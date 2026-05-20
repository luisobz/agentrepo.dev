# Task 2: Interfaz Visual de la Pizarra Trello (Kanban Board & Cards Reutilizables)

## Descripción
Crear el diseño visual interactivo y los componentes de la pizarra estilo Trello (Kanban Board) en la web. La pizarra debe ser moderna, estética (glassmorphism premium, bordes garnet tenues) y constar de componentes altamente reutilizables y modulares que sirvan tanto para la simulación como para la ejecución real impulsada por IA.

## Archivos a crear o modificar
- `apps/web/src/modules/web-workflow-agent/components/playground-board.tsx` (Contenedor del tablero Kanban).
- `apps/web/src/modules/web-workflow-agent/components/playground-card.tsx` (Componente de tarjeta reutilizable).
- `apps/web/src/modules/web-workflow-agent/components/avatar-guidance.tsx` (Banner de diálogo del avatar de guía).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `apps/web/src/modules/web-workflow-agent/components/playground-card.spec.tsx`
- Tipo: Componente.
- Qué debe probar:
  1. Renderizar la tarjeta pasando propiedades básicas (título, sub-tareas, agente activo, estado de error).
  2. Verificar que se renderiza el agente activo si existe, o el listado de sub-tareas completadas.
  3. Asegurar que las acciones interactivas (ej. botón de previsualización) disparen los callbacks asignados.

## Criterios de finalización
- [ ] **Tablero Kanban (`playground-board.tsx`):**
  - Renderiza 5 columnas alineadas horizontalmente (o adaptadas a scroll en móvil):
    1. **Backlog:** Tareas iniciales en espera.
    2. **Desarrollar (Develop):** Tarea que está siendo programada por el sub-agente Coder.
    3. **Testing:** Tarea que está corriendo suites de pruebas por el sub-agente Tester.
    4. **Review:** Tareas con código terminado, listas para previsualización interactiva.
    5. **Deploy:** Tareas completamente desplegadas en producción.
  - Implementa drag & drop nativo de HTML5 (`onDragStart`, `onDragOver`, `onDrop`) en las columnas y tarjetas para moverlas de forma interactiva.
- [ ] **Tarjetas de Tareas (`playground-card.tsx`):**
  - Muestra el título del requerimiento.
  - Muestra un listado de sub-tareas (lista con checkmarks interactivos o automáticos, ej: "✓ Write code", "✓ Setup tests").
  - Muestra un badge visual premium con el sub-agente actualmente asignado (ej. `[CoderAgent]` en azul, `[TesterAgent]` en naranja, `[DeployerAgent]` en verde).
  - Estado de error visual destacado si una tarea falla en Testing.
  - Botón "Ver Previsualización" que aparece únicamente en la columna **Review**.
- [ ] **Avatar Guidance (`avatar-guidance.tsx`):**
  - Banner en la parte superior donde el Avatar reacciona y habla al usuario en un globo de diálogo: *"¡Hola! Arrastra una de las tareas del Backlog a 'Desarrollar' para ver cómo mis subagentes se ponen a trabajar."*
