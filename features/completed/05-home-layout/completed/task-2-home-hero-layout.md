# Task 2: Home Hero Layout y Buscador Central

## Descripción
Construir el "above the fold" de la página de inicio. Esto incluye el texto principal ("Less noise, more signal"), el subtexto de intenciones y, lo más importante, la ubicación del `AvatarSlot` inicial y el Input de búsqueda (Command Palette trigger o search bar grande).

## Archivos a crear o modificar
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/home/hero.tsx` (Opcional, extracción del hero).

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/web/src/app/page.spec.tsx` (test de renderizado de la página en sí).
- Tipo: Componente.
- Qué debe probar: La página contiene el h1 y el input de búsqueda.
- Assertions: Los elementos semánticos principales existen.

## Criterios de finalización
- [ ] La Home (`page.tsx`) muestra el título principal estilizado con la tipografía adecuada, posiblemente mezclando pesos de Geist y colores (ej. texto principal en oscuro, detalles en granate).
- [ ] Existe un Input grande, accesible y claramente visible en el centro, invitando al usuario a interactuar ("Search skills, agents, knowledge...").
- [ ] Hay un `<AvatarSlot id="home-hero" />` estratégicamente posicionado cerca del Input o el Título para que el avatar aparezca ahí al cargar la página.
- [ ] El layout debe dejar suficiente respiro (margin/padding) cumpliendo la máxima "Menos es más".

## Notas Técnicas
- El Input de búsqueda en este punto puede ser puramente visual y redirigir a un componente dummy o no hacer nada. La lógica de apertura del buscador FTS se realizará en la feature 06.
- Recuerda usar `max-w-screen-md` o similar para constreñir el ancho del hero y mantener la legibilidad.
