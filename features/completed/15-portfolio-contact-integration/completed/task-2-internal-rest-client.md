# Task 2: Cliente REST Interno Asíncrono (BFF -> AI)

## Descripción
El BFF (`backend-web`) debe delegar el flujo de IA pesado a `backend-ai` sin bloquear el hilo principal. Tras confirmar el guardado exitoso en base de datos, el BFF disparará una llamada REST `POST /internal/workflow/contact` a `backend-ai` de forma asíncrona ("fire and forget").

## Archivos a crear o modificar
- `packages/infrastructure/src/ai/internal-client/internal-workflow.service.ts` (Cliente REST).
- `packages/application/src/portfolio/use-cases/submit-contact.use-case.ts` (Actualizar caso de uso para disparar la llamada).

## Criterios de finalización
- [ ] Implementar un adaptador o cliente HTTP (`fetch` o `axios`) robusto para llamadas internas.
- [ ] El cliente realiza un POST a `http://localhost:<AI_PORT>/internal/workflow/contact` con el payload de contacto.
- [ ] Incluye en los headers la clave secreta compartida `x-internal-key` leída de `process.env.INTERNAL_API_KEY`.
- [ ] **Llamada Asíncrona (Fire & Forget):**
  - La promesa se dispara pero NO se espera con `await` antes de retornar la respuesta tRPC al usuario. Se gestionan los posibles fallos de conexión local con un bloque `.catch` que registre el error en los logs del sistema (`Logger` de NestJS).
