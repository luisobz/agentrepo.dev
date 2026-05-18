# Task 3: Formulario CRUD de Skills

## Descripción
Formulario interactivo para crear y actualizar los metadatos de una Skill. Requiere validación de frontend con `zod` y `react-hook-form` antes de enviar la petición tRPC.

## Archivos a crear o modificar
- `apps/admin/src/app/skills/new/page.tsx`
- `apps/admin/src/app/skills/[id]/page.tsx`
- `apps/admin/src/components/skills/skill-form.tsx`

## Criterios de finalización
- [ ] Formulario con inputs para Título y Slug. Al escribir el título, el slug se genera automáticamente (con utilidades como `slugify` o regex).
- [ ] Select/Radio para elegir el Tipo (prompt, system, config, template).
- [ ] Checkbox o Switch para estado de publicación.
- [ ] Envía los datos correctamente mediante `trpc.createSkill.useMutation()`.
