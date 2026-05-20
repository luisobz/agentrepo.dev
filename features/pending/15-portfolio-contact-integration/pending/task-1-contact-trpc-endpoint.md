# Task 1: Endpoint tRPC de Contacto (BFF)

## Descripción
Crear la mutación en tRPC para recibir y persistir el submit del formulario de contacto del portfolio en el BFF (`backend-web`).

## Archivos a crear o modificar
- `packages/trpc/src/lib/routers/contact.router.ts` (Router de tRPC).
- `packages/trpc/src/lib/routers/_app.ts` (Montar el router).
- `packages/domain/src/portfolio/entities/contact-request.entity.ts` (Entidad de dominio).
- `packages/application/src/portfolio/use-cases/submit-contact.use-case.ts` (Caso de uso).

## Criterios de finalización
- [ ] Definir el esquema Zod en tRPC para el payload:
  - `email`: string tipo email obligatorio.
  - `subject`: string obligatorio enum ("employment" | "freelance" | "question" | "other").
  - `message`: string obligatorio de mínimo 10 caracteres.
- [ ] Guardar en base de datos PostgreSQL un registro en la tabla `ContactRequest` con campos: `id`, `email`, `subject`, `message`, `status` (`PENDING`), `createdAt`.
- [ ] Retorna un objeto `{ success: true, id: string }` de forma rápida al cliente.
