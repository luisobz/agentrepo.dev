# Task 4: Configuración del Cliente tRPC en el Frontend (Next.js)

## Descripción
Para cerrar el ciclo de tRPC, se debe configurar el Provider del cliente en la aplicación web (`apps/web`) y de admin (`apps/admin`). Usaremos la integración de React Query (`@trpc/react-query`). El objetivo final es demostrar que una consulta viaja desde el cliente Next.js hasta el `backend-web` y devuelve resultados tipados.

## Archivos a crear o modificar
- `packages/trpc/src/client/index.ts` (Setup del `createTRPCReact<AppRouter>()` exportado).
- `apps/web/src/components/providers/trpc-provider.tsx` (Componente wrapper del QueryClientProvider y trpc.Provider).
- `apps/web/src/app/layout.tsx` (Envolver children con el Provider).
- Modificar un page (ej. `apps/web/src/app/page.tsx`) temporalmente para ejecutar la query de saludo (`trpc.hello.useQuery()`).

## Tests que deben escribirse ANTES de implementar
- Archivo: No aplica test unitario directo aquí al depender de renderizado React con contexto complejo, se valida manualmente o con e2e (Cypress/Playwright si existieran).

## Criterios de finalización
- [ ] El componente `TRPCProvider` está implementado correctamente y maneja el `QueryClient`.
- [ ] La URL del backend se lee de variables de entorno (ej. `NEXT_PUBLIC_API_URL` -> http://localhost:3333/api/trpc).
- [ ] Al visualizar la home en el navegador, se realiza un fetch exitoso a la query "hello" y se pinta en pantalla sin errores de TS.
- [ ] TypeScript autocompleta las queries en el lado del cliente basado en `AppRouter`.

## Notas Técnicas
- Utiliza la documentación oficial de `@trpc/react-query` en su versión más reciente (v11 si es posible).
- Dado que usamos Next.js App Router, el `TRPCProvider` **debe ser un Client Component** (inicia el archivo con `"use client"`). Se importa este provider en el `layout.tsx` que es un Server Component.
- La importación del tipo del backend en el frontend de forma segura se debe hacer usando `import type { AppRouter } from '@agentrepo/trpc'`.
