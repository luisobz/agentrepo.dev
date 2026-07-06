# Task 3: Casos de Uso de Skills (Application)

## Descripción
Implementar la lógica de negocio para interactuar con las Skills. Esto incluye casos de uso para crear, leer (listar/detalle), actualizar y eliminar.

## Archivos a crear o modificar
- `packages/application/src/skills/create-skill.use-case.ts`
- `packages/application/src/skills/get-skills.use-case.ts`
- `packages/application/src/skills/update-skill.use-case.ts`
- `packages/application/src/skills/delete-skill.use-case.ts`

## Criterios de finalización
- [ ] Todos los casos de uso reciben el puerto `SkillsPort` por inyección (constructor).
- [ ] Se implementan validaciones lógicas (ej. al crear, comprobar si el slug ya existe y lanzar error de dominio).
- [ ] Tests unitarios implementados para al menos la creación y listado, mockeando el `SkillsPort`.
