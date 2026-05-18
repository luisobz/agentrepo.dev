# Task 3: Componente Frontend Command Palette

## Descripción
Construir el componente visual (Command Palette) donde el usuario realiza la búsqueda en la web. Es un modal interactivo que puede ser invocado con atajos de teclado (`Cmd/Ctrl + K`) o clicando en el buscador visual de la Home. 

## Archivos a crear o modificar
- `apps/web/src/components/search/command-palette.tsx`
- `apps/web/src/app/layout.tsx` (Montar el modal a nivel superior).
- Integrar la apertura en `apps/web/src/components/home/hero.tsx` o donde se haya puesto el trigger.

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/web/src/components/search/command-palette.spec.tsx`
- Tipo: Componente/DOM.
- Qué debe probar:
  - Inicialmente está oculto.
  - Al simular el evento `keydown` (Cmd+K), el componente cambia su estado y se monta/muestra.
- Assertions: Cambio de visibilidad en el DOM.

## Criterios de finalización
- [ ] Componente implementado basado en `cmdk` (o la abstracción de `shadcn/ui` -> `Command`).
- [ ] El modal tiene un blur/overlay detrás y se centra en la pantalla.
- [ ] Usa `trpc.search.global.useQuery` con `keepPreviousData: true` y un hook para debouncing del input de texto del usuario.
- [ ] Los resultados renderizan su Título y el `TypeChip` correspondiente.
- [ ] Al seleccionar un resultado o pulsar Enter, navega (`next/navigation` `useRouter`) al slug/URL correcta.

## Notas Técnicas
- Instala la versión base de command si no lo hiciste: `pnpm dlx shadcn@latest add command` y `pnpm dlx shadcn@latest add dialog`.
- Para el debounce, puedes usar una utilidad custom (ej. `useDebounce`) para no disparar llamadas tRPC por cada tecla presionada, sino cada ~300ms.
- El atajo de teclado global se debe añadir usando un `useEffect` que añada un listener a `window` y prevenga el comportamiento por defecto de `Cmd/Ctrl+K` del navegador.
