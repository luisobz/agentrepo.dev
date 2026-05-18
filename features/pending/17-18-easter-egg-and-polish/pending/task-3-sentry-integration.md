# Task 3: Integración de Sentry

## Descripción
Preparación final para producción en Spaceship. Integrar Sentry para atrapar excepciones en runtime en frontend y backend.

## Criterios de finalización
- [ ] Instalación de `@sentry/nextjs` en la aplicación Web y Admin usando el wizard oficial (`npx @sentry/wizard@latest -i nextjs`).
- [ ] Instalación de `@sentry/nestjs` y `@sentry/node` en el `backend-web` y `backend-ai`.
- [ ] Comprobar que en desarrollo está deshabilitado por defecto pero que compila correctamente y no interfiere con el build de Nx.
