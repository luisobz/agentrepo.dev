# Task 1: Inicialización de shadcn/ui en el paquete UI

## Descripción
Debes inicializar y configurar la librería `shadcn/ui` en el paquete de UI del monorepo (`packages/ui`). Dado que usamos una arquitectura monorepo Nx con Tailwind v4, la inicialización estándar puede requerir ajustes manuales. El objetivo es que `shadcn/ui` sepa depositar los componentes generados en `packages/ui/src/components/base` (o similar) y que utilicen las dependencias globales del proyecto (`lucide-react`, `clsx`, `tailwind-merge`, etc.). Además, se debe proveer la utilidad `cn` fundamental para shadcn.

## Archivos a crear o modificar
- `packages/ui/components.json` (Archivo de configuración de shadcn).
- `packages/ui/src/lib/utils.ts` (Implementación de la función `cn` con `clsx` y `twMerge`).
- `packages/ui/src/index.ts` (Exportar las utilidades si es necesario).
- Posibles modificaciones a `package.json` en la raíz para dependencias de shadcn (radix, tailwind-merge, clsx).

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/ui/src/lib/utils.spec.ts`
- Tipo: Test Unitario (Jest/Vitest).
- Qué debe probar: El funcionamiento de la función `cn()`.
- Casos de prueba:
  - Input `cn('p-2', 'p-4')` -> Output esperado: `'p-4'`.
  - Input `cn('bg-red-500', undefined, null, false, 'text-white')` -> Output esperado: `'bg-red-500 text-white'`.
- Assertions: Utilizar `expect(cn(...)).toBe(...)`.

## Criterios de finalización
- [ ] La función `cn` está implementada en `packages/ui/src/lib/utils.ts` usando `clsx` y `tailwind-merge`.
- [ ] Los tests de la función `cn` pasan correctamente.
- [ ] El archivo `components.json` está creado en `packages/ui` o en la raíz, configurado para escribir componentes en `packages/ui/src/components/base` y utilizar las importaciones alias correctas (ej. `@agentrepo/ui/lib/utils`).
- [ ] Todas las dependencias base de shadcn (`lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`) están instaladas en el `package.json` raíz o en el del paquete `ui`.

## Notas Técnicas
- Shadcn CLI: `pnpm dlx shadcn@latest init`.
- Ten cuidado con las rutas alias en `components.json`. Deben coincidir con cómo el compilador de TypeScript y Nx resuelven los imports en el monorepo (usualmente definidos en `tsconfig.base.json`).
- Tailwind v4 elimina muchas configuraciones en `tailwind.config.js`; asegúrate de que el `components.json` de shadcn sea compatible con que estés usando directivas CSS (o ignorar la creación/edición automática del tailwind config de shadcn).
