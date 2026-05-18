# Task 2: Listado de Skills (Admin)

## Descripción
Página que muestra todas las Skills existentes para su gestión. Usa el endpoint `getSkills` expuesto por tRPC para popular una tabla.

## Archivos a crear o modificar
- `apps/admin/src/app/skills/page.tsx`
- `apps/admin/src/app/skills/columns.tsx` (Si se usa shadcn Data Table / Tanstack Table).

## Criterios de finalización
- [ ] Página de listado renderizando una tabla limpia.
- [ ] Columnas: Título, Slug, Tipo (renderizado con `TypeChip`), Estado (Publicado/Borrador), Fecha de actualización, Acciones (Editar/Borrar).
- [ ] Botón principal para "Crear nueva Skill" en la cabecera.
