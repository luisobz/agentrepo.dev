# Task 2: Componente Visual AvatarSprite

## Descripción
El componente `AvatarSprite` es la representación visual del personaje en la pantalla. Debe leer del `AvatarContext` su variante emocional (`emotion`) y renderizar el asset o colores correspondientes. Para este estado inicial, bastará con representar el avatar como un contenedor visual con características de marca, pero preparado para incluir SVGs en el futuro.

## Archivos a crear o modificar
- `apps/web/src/components/avatar/avatar-sprite.tsx`
- `apps/web/src/components/avatar/index.ts` (Opcional, para exports limpios).

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/web/src/components/avatar/avatar-sprite.spec.tsx`
- Tipo: Componente.
- Qué debe probar: Renderiza correctamente basado en diferentes props o estado mockeado del contexto.
- Assertions: Comprobar que las clases CSS cambian cuando la emoción pasa de `idle` a `happy`.

## Criterios de finalización
- [ ] Componente `AvatarSprite` implementado.
- [ ] Renderiza visualmente un círculo o cuadrado redondeado (placeholder del avatar) con un color de fondo base (ej. `--bg-surface` y borde `--brand-garnet-muted`).
- [ ] Opcionalmente, renderiza un SVG placeholder (ej. un icono de Lucide `Bot` o cara).
- [ ] Cambia sutilmente su aspecto basado en la emoción actual leída del `useAvatar`.

## Notas Técnicas
- Separa la lógica visual de la posicional. El `AvatarSprite` no debe saber *dónde* está en la pantalla (eso lo decide el slot o framer motion), solo debe saber *qué aspecto* tiene.
