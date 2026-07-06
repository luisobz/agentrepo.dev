# Task 4: Integración Monaco Editor para Markdown

## Descripción
El campo más importante de una Skill es su contenido. El administrador debe poder escribir este código/markdown en un editor cómodo con autocompletado y resaltado de sintaxis, usando el paquete `@monaco-editor/react`.

## Archivos a crear o modificar
- `apps/admin/src/components/skills/skill-editor.tsx`
- Modificación del form de la Task 3 para incluir este editor.
- `package.json` de admin o root para añadir dependencias.

## Criterios de finalización
- [ ] Monaco Editor importado y funcional en el formulario.
- [ ] El lenguaje por defecto está configurado a `markdown`.
- [ ] El tema del editor encaja o se lee bien con el modo claro/Ivory del panel de control.
- [ ] El texto editado se guarda correctamente en el payload que se envía al backend.
