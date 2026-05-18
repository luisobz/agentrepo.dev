# Task 1: Endpoint tRPC de Contacto

## Descripción
En el `backend-web` (BFF), crear la mutación tRPC para recibir el submit del portfolio.

## Criterios de finalización
- [ ] `packages/trpc/src/lib/routers/contact.ts` expone `trpc.contact.submit`.
- [ ] Guarda los datos del payload en base de datos (`ContactRequest`).
- [ ] Retorna success rápido al cliente.
