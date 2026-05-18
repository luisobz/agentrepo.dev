# Task 3: Componente Visualizador Markdown (Rendered vs Raw)

## Descripción
Construir un componente complejo en el cliente que permita al usuario alternar entre la vista renderizada del Markdown y la vista "Raw" cruda (la más útil para copiar prompts).

## Archivos a crear o modificar
- `apps/web/src/components/skills/markdown-viewer.tsx`
- Instalación de dependencias para Markdown (ej. `react-markdown`, `remark-gfm`).

## Criterios de finalización
- [ ] El componente recibe el string de Markdown como prop `content`.
- [ ] Tiene unas pestañas estilo Tabs (Raw | Rendered).
- [ ] En modo "Raw", muestra el texto en un elemento `<pre><code>` monoespaciado con overflow manejado y un color de fondo sutil o estilo Consola (Feature 02).
- [ ] En modo "Rendered", procesa el Markdown para mostrar HTML estandarizado usando los tokens del design system para encabezados, listas y enlaces.
