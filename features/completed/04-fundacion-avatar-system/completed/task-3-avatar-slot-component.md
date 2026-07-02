# Task 3: Componente AvatarSlot

## Descripción
El `AvatarSlot` es un contenedor invisible (o estructural) que se ubicará en diferentes partes del layout de la página (ej. en el Header, en la barra lateral de Skills). Cuando el ID de este slot coincide con el `currentSlot` del `AvatarContext`, el `AvatarSprite` debe renderizarse en su interior.

## Archivos a crear o modificar
- `apps/web/src/modules/shared/avatar/avatar-slot.tsx`

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `apps/web/src/modules/shared/avatar/avatar-slot.spec.tsx`
- Tipo: Componente/Integración.
- Qué debe probar:
  1. Si el contexto dice que el slot actual es `'header'`, el `<AvatarSlot id="header" />` renderiza el sprite.
  2. Si el contexto dice que el slot actual es `'header'`, el `<AvatarSlot id="sidebar" />` NO renderiza nada en su interior (queda vacío).

## Criterios de finalización
- [ ] Componente `AvatarSlot` implementado aceptando un prop `id: string`.
- [ ] Utiliza el hook `useAvatar` para comprobar si `currentSlot === id`.
- [ ] Si coinciden, renderiza el componente `AvatarSprite` en su interior. En caso contrario, renderiza `null` (o un placeholder invisible con el mismo tamaño si se quiere preservar el espacio).

## Notas Técnicas
- Para evitar saltos abruptos (CLS - Cumulative Layout Shift), considera que el `AvatarSlot` debe tener dimensiones fijas idénticas a las del sprite incluso cuando está vacío, o utilizar estrategias de posicionamiento absoluto si el diseño lo dictamina. Para AgentRepo, asume dimensiones fijas (ej. `w-12 h-12`).
