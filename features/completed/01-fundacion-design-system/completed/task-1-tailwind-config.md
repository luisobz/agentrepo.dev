# Task 1: Configuración de Tailwind CSS v4

## Descripción
AgentRepo.dev utilizará Tailwind CSS v4 para todo el styling de la interfaz. Tailwind v4 elimina gran parte de la configuración basada en JS y adopta un modelo más centrado en CSS utilizando la directiva `@theme`. El objetivo de esta tarea es asegurar que Tailwind v4 esté correctamente configurado en el monorepo, de manera que tanto `apps/web` como `apps/admin` (y cualquier componente dentro de `packages/ui`) puedan compilar y usar las clases utilitarias de Tailwind.

## Archivos a crear o modificar
- `packages/ui/src/styles/globals.css` (Crear o modificar si existe)
- `apps/web/src/app/layout.tsx` o equivalente
- `apps/admin/src/app/layout.tsx` o equivalente
- `apps/web/src/app/global.css` (Podría ser eliminado o reducido a importar desde packages/ui)
- `apps/admin/src/app/global.css` (Podría ser eliminado o reducido a importar desde packages/ui)
- Posibles ajustes en los `project.json` o `package.json` si hay scripts de construcción necesarios.

## Tests que deben escribirse ANTES de implementar
*(Nota: Para configuración pura de build/css, las aserciones de E2E son las más adecuadas, pero a este nivel de infraestructura basta con tests visuales o comprobaciones de compilación).*
- Archivo: No aplica un archivo de test específico Jest/Vitest para la configuración CSS.
- Tipo: Integración manual / Compilación.
- Qué debe probar: La ejecución de `pnpm nx build web` y `pnpm nx build admin` no debe generar errores de compilación de PostCSS o Tailwind.
- Asersión esperada: Las clases base como `bg-red-500` añadidas temporalmente a un componente principal se reflejan correctamente al hacer `serve`.

## Criterios de finalización
- [ ] Tailwind v4 está importado mediante `@import "tailwindcss";` en un CSS global, preferiblemente en `packages/ui/src/styles/globals.css`.
- [ ] Las aplicaciones Next.js (`web` y `admin`) consumen este CSS global.
- [ ] No existen archivos `tailwind.config.js` antiguos si Tailwind v4 los hace innecesarios.
- [ ] Los scripts de build en Nx funcionan sin errores de estilos.

## Notas Técnicas
- Revisa las guías de actualización o uso de Tailwind v4 en proyectos Next.js/Nx.
- Se debe asegurar que Nx observe cambios en los archivos dentro de `packages/ui` para recompilar el CSS de las apps Next.js en el modo de desarrollo.
- En v4, la configuración para que el compilador sepa dónde buscar clases CSS se maneja diferente (a través del engine que escanea todos los archivos por defecto o configurado explícitamente en el css principal). Revisa la documentación de v4 para asegurarte de que escaneará tanto `apps/**/src/**/*.{ts,tsx}` como `packages/ui/src/**/*.{ts,tsx}`.
