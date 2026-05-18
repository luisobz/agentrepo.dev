# Task 1: Entidades de Dominio de Skills

## Descripción
Definir la entidad pura `Skill` en el paquete de dominio y los puertos (interfaces) que la capa de infraestructura deberá implementar para proveer los datos.

## Archivos a crear o modificar
- `packages/domain/src/skills/skill.entity.ts`
- `packages/domain/src/skills/skill.types.ts`
- `packages/application/src/skills/skills.port.ts`

## Criterios de finalización
- [ ] La entidad `Skill` está definida con las propiedades: `id`, `slug`, `title`, `description`, `content` (Markdown), `type` (enum `SkillType`: prompt, system, config, template), `isPublished`, `createdAt`, `updatedAt`.
- [ ] El puerto `SkillsPort` define métodos como `save()`, `findBySlug()`, `findAll()`, `delete()`.
- [ ] TypeScript puro, sin dependencias externas.
