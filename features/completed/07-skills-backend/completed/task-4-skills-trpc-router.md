# Task 4: Router tRPC para Skills

## Descripción
Exponer los casos de uso creados en la capa de aplicación a través de endpoints fuertemente tipados usando tRPC para que el frontend pueda consumirlos.

## Archivos a crear o modificar
- `packages/trpc/src/lib/routers/skills.ts`
- `packages/trpc/src/lib/routers/_app.ts` (Importar el sub-router).

## Criterios de finalización
- [ ] Router de tRPC implementado exportando `getSkills` (public), `getSkillBySlug` (public), `createSkill` (protected admin, de momento usar public temporal o mock), `updateSkill`, `deleteSkill`.
- [ ] Validaciones de entrada implementadas con `zod` (`z.object({...})`) reflejando los DTOs de los casos de uso.
- [ ] Manejo correcto de errores mapeando excepciones de dominio a errores TRPC (`TRPCError({ code: 'NOT_FOUND' })`).
