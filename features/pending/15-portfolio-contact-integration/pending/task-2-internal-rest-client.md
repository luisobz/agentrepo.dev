# Task 2: Cliente REST Interno (BFF -> AI)

## Descripción
El BFF debe delegar el trabajo pesado sin bloquear. Tras guardar en DB, debe invocar al `backend-ai`.

## Criterios de finalización
- [ ] Implementar un adaptador o cliente HTTP (`fetch` o `axios`) en `backend-web`.
- [ ] Hace un POST a `http://localhost:<AI_PORT>/internal/contact` usando una secret key pre-compartida (vía ENV) para seguridad local.
- [ ] Llamada asíncrona ("fire and forget") sin bloquear la respuesta de tRPC.
