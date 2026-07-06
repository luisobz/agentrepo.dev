# Task 1: Tokens de Acceso al Playground (Backend & Admin)

## Descripción
Las llamadas reales a modelos de lenguaje (LLM) tienen un coste. Para permitir que el portfolio e IDE públicos tengan pruebas funcionales sin abusar, crearemos un sistema de **PlaygroundTokens** controlados y generados desde el panel de administración (`apps/admin`).

## Archivos a crear o modificar
- `prisma/schema.prisma` (Añadir modelo `PlaygroundToken`).
- `packages/domain/src/playground/entities/playground-token.entity.ts` (Entidad).
- `packages/application/src/playground/ports/token-repository.port.ts` (Puerto).
- `packages/infrastructure/src/persistence/prisma/prisma-token.repository.ts` (Adaptador).
- `packages/trpc/src/lib/routers/playground.router.ts` (Router tRPC).
- `apps/admin/src/app/playground-tokens/page.tsx` (Panel CRUD en admin).

## Criterios de finalización
- [ ] **Modelo Prisma:**
  - `PlaygroundToken` con campos: `id` (String), `token` (String, único, ej. hash o uuid), `label` (String descriptivo, ej. "Feria de Empleo 2026"), `maxUses` (Int, ej. 5), `usesCount` (Int, default 0), `expiresAt` (DateTime), `isActive` (Boolean, default true).
- [ ] **Administración (`apps/admin`):**
  - Vista CRUD para generar tokens: el administrador introduce una etiqueta, número máximo de usos y fecha de expiración, y obtiene el token generado.
  - Tabla de visualización con número de usos y validez.
- [ ] **Validación:**
  - Endpoint tRPC `playground.validateToken(token)` en el BFF que retorna si el token es válido o no, incrementando el contador si se ejecuta.
