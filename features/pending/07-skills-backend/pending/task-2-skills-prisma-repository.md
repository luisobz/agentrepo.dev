# Task 2: Repositorio Prisma para Skills

## Descripción
Implementar el esquema de base de datos para la entidad Skill y crear el adaptador que cumpla con el puerto definido en la capa de aplicación.

## Archivos a crear o modificar
- `prisma/schema.prisma`
- `packages/infrastructure/src/persistence/prisma/repositories/skills.repository.ts`

## Criterios de finalización
- [ ] Modelo `Skill` añadido a `schema.prisma` y ejecutada migración (`prisma migrate dev`).
- [ ] Clase `SkillsRepository` implementada satisfaciendo `SkillsPort` usando el `PrismaService`.
- [ ] Mapeo correcto entre las entidades de base de datos (`@prisma/client`) y las entidades puras de dominio (`SkillEntity`).
