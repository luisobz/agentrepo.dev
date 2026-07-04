# Task 2: Componente Visual AvatarSprite

## Descripción
El componente `AvatarSprite` es la representación visual del personaje en la pantalla. Debe leer del `AvatarContext` su variante emocional (`emotion`) y renderizar el asset o colores correspondientes. Para este estado inicial, bastará con representar el avatar como un contenedor visual con características de marca, pero preparado para incluir SVGs o animaciones CSS en el futuro.

## Archivos a crear o modificar
- `apps/web/src/modules/shared/avatar/avatar-sprite.tsx`
- `apps/web/src/modules/shared/avatar/index.ts` (Exports limpios).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `apps/web/src/modules/shared/avatar/avatar-sprite.spec.tsx`
- Tipo: Componente.
- Qué debe probar:
  1. Renderiza correctamente el sprite basado en el estado mockeado del contexto.
  2. Verifica que las clases de estilo cambien o se apliquen variaciones visuales cuando la emoción pasa de `'idle'` a `'happy'`.

## Criterios de finalización
- [ ] Componente `AvatarSprite` implementado en `apps/web/src/modules/shared/avatar/avatar-sprite.tsx`.
- [ ] Renderiza visualmente un círculo o cuadrado redondeado (placeholder del avatar) con un color de fondo base (usando variables CSS del design system `--bg-surface` y borde `--brand-garnet-muted`).
- [ ] Incluye un SVG o cara básica (ej. un icono de Lucide `Bot` o cara sonriente/pensativa) que reacciona a la emoción actual leída del `useAvatar`.
- [ ] Las clases Tailwind CSS v4 reflejan un aspecto premium e interactivo (ej. micro-rotaciones al pasar el cursor).

## Notas Técnicas
- Separa la lógica visual de la posicional. El `AvatarSprite` no debe saber *dónde* está en la pantalla (eso lo decide el slot o framer motion), solo debe saber *qué aspecto* tiene.
