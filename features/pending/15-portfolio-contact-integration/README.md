# Feature 15: Portfolio Contact Integration

## Meta
- **Número:** 15
- **Fase:** Fase 4 — Portfolio y Playground
- **Objetivo detallado:** Conectar el formulario del frontend con el backend-web (vía tRPC) y que este, tras guardar en base de datos, despache asíncronamente el trabajo a `backend-ai`.

## Alcance
- Endpoint tRPC `contact.submit`.
- Almacenamiento en DB (`ContactRequest`).
- Llamada REST `fetch()` o `axios` a `backend-ai` sin `await` bloqueante.

## Lista de Tasks
1. `task-1-contact-trpc-endpoint.md`: Recibir y validar.
2. `task-2-internal-rest-client.md`: Delegar a IA.
3. `task-3-frontend-form-submission.md`: Hooking del frontend form.
