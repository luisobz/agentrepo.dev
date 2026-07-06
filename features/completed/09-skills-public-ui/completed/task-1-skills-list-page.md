# Task 1: Listado Público de Skills

## Descripción
Maquetar la página `/skills` en la aplicación pública web. Mostrará un listado tipo grid o lista apilada de las Skills extraídas del backend tRPC, y debe incluir un método básico de filtrado en cliente (ej. por tag o type).

## Archivos a crear o modificar
- `apps/web/src/app/skills/page.tsx`
- `apps/web/src/components/skills/skill-card.tsx`

## Criterios de finalización
- [ ] La página invoca `getSkills` filtrando por `isPublished: true`.
- [ ] Cada Skill se renderiza en un `SkillCard` que muestra el Título, una truncada descripción o extracto, y su `TypeChip`.
- [ ] Clicar en la tarjeta navega por la ruta `/skills/[slug]`.
