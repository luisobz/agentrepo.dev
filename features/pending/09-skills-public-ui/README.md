# Feature 09: Skills Public UI

## Meta
- **Número:** 09
- **Fase:** Fase 2 — Home y Skills
- **Objetivo detallado:** Construir la experiencia pública (para usuarios finales) del listado y detalle de las Skills. El diseño prioriza la funcionalidad, mostrando el contenido en formato código "Raw" (copiable/descargable) y alternativamente su renderizado Markdown. 

## Alcance
- **Incluye:**
  - Página `/skills` para listar todas las skills publicadas.
  - Componente de búsqueda local o integración con búsqueda global.
  - Página `/skills/[slug]` (SSG o ISR idealmente).
  - Componente visor de Markdown/Código con botón Copy/Download.
- **NO incluye:**
  - Interacción de usuario como "likes" o "comentarios".

## Criterios de Aceptación
1. La página de `/skills` carga rápido y muestra en tarjetas limpias los recursos.
2. Al entrar en `/skills/un-prompt`, el layout principal destina al menos 70% de su ancho al bloque de contenido.
3. Se puede alternar entre "Rendered" (markdown visualizado con listas, negritas, links) y "Raw" (código plano monoespaciado en una caja tipo terminal).
4. Un botón de "Copy" copia todo el contenido crudo al portapapeles del usuario con un solo clic.

## Dependencias
- Requiere **Feature 07** (Skills Backend).
- Requiere **Feature 02** (Componentes).

## Componentes del sistema implicados
- `apps/web/src/app/skills`
- `apps/web/src/components/skills`

## Lista de Tasks
1. `task-1-skills-list-page.md`: Listado público.
2. `task-2-skills-detail-layout.md`: Layout de detalle.
3. `task-3-markdown-viewer-component.md`: Visualizador Rendered/Raw.
4. `task-4-copy-download-actions.md`: Acciones de usuario.
