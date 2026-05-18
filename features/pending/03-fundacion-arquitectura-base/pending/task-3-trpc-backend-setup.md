# Task 3: Configuración del Router tRPC en el Backend (NestJS)

## Descripción
Para que el frontend pueda consumir datos de manera tipada de extremo a extremo, usaremos tRPC. En esta tarea deberás implementar el router raíz (App Router) en `packages/trpc` e integrarlo en `apps/backend-web` utilizando el adaptador adecuado (usualmente Express o Fastify). 

## Archivos a crear o modificar
- `packages/trpc/src/lib/trpc.ts` (Instanciación de la función `initTRPC.create()`).
- `packages/trpc/src/lib/routers/_app.ts` (Router raíz con un sub-router de salud/hello world).
- `apps/backend-web/src/trpc/trpc.controller.ts` o equivalente. (O middleware en main.ts usando `trpcExpress.createExpressMiddleware`).
- `apps/backend-web/src/trpc/trpc.module.ts`.

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/backend-web/src/trpc/trpc.controller.spec.ts` (o e2e test equivalente).
- Tipo: E2E (NestJS).
- Qué debe probar: Hacer una petición GET a la ruta designada de trpc (ej: `/api/trpc/health.check`) debe devolver un status 200 y el JSON esperado.
- Assertions: Respuesta HTTP OK.

## Criterios de finalización
- [ ] La instancia de tRPC (`initTRPC`) está creada y exportada en el paquete `trpc`.
- [ ] Existe un `appRouter` con al menos una consulta `hello` o `health`.
- [ ] La aplicación `backend-web` sirve las rutas tRPC en `/api/trpc/*` sin lanzar errores de NestJS.
- [ ] Exportar el tipo `AppRouter` desde `packages/trpc` para que el frontend pueda importarlo exclusivamente como tipo.

## Notas Técnicas
- NestJS y tRPC requieren un puente para funcionar juntos. Usualmente, dado que NestJS usa Express por debajo (o Fastify), puedes montar el middleware en `main.ts` usando algo como:
  ```typescript
  import * as trpcExpress from '@trpc/server/adapters/express';
  // en bootstrap():
  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({ router: appRouter }),
  );
  ```
- O alternativamente, usar una integración más nativa de NestJS como un controlador con `All` y adaptarlo, aunque el middleware de Express es el más directo y oficial.
- Asegúrate de habilitar CORS en el backend si las URLs de dev (`web` vs `backend-web`) difieren en puertos, aunque si es proxy no hará falta.
