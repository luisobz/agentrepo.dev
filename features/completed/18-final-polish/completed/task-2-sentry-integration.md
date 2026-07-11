# Task 2: Integración de Sentry para Observabilidad

## Descripción
Preparación final para el despliegue a producción en Spaceship Essential. Integrar Sentry para registrar excepciones, capturar errores de runtime en frontend (`apps/web`, `apps/admin`) y backend (`backend-web`, `backend-ai`), garantizando observabilidad integral.

## Archivos a crear o modificar
- `apps/web/sentry.client.config.ts`, `apps/web/sentry.server.config.ts`, `apps/web/sentry.edge.config.ts`
- `apps/admin/sentry.client.config.ts` (etc.)
- `apps/backend-web/src/main.ts` (Setup de Sentry en el bootstrap)
- `apps/backend-ai/src/main.ts` (Setup de Sentry en el bootstrap)
- `package.json`

## Criterios de finalización
- [ ] **Frontend Integration (Next.js):**
  - Instalar `@sentry/nextjs` en `apps/web` y `apps/admin`.
  - Crear los ficheros de configuración de Sentry correspondientes apuntando al DSN correspondiente (configurable por ENV).
- [ ] **Backend Integration (NestJS):**
  - Instalar `@sentry/node` y `@sentry/nestjs` en `backend-web` y `backend-ai`.
  - Registrar el interceptor global de Sentry (`SentryInterceptor` o `@sentry/nestjs` helper) en los módulos de NestJS para capturar automáticamente excepciones HTTP 500 no controladas.
- [ ] **Desactivación en Desarrollo:**
  - Asegurar que Sentry solo se inicialice si `process.env.NODE_ENV === 'production'` y `process.env.SENTRY_DSN` existe, previniendo telemetría innecesaria en local.
  - Asegurar que el build de Nx compila correctamente sin errores de source maps o Webpack/SWC plugins de Sentry.
