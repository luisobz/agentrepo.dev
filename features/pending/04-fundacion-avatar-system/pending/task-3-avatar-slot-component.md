# Task 3: Componente AvatarSlot

## Descripción
El `AvatarSlot` es un contenedor invisible (o estructural) que se ubicará en diferentes partes del layout de la página (ej. en el Header, en la barra lateral de Skills). Cuando el ID de este slot coincide con el `currentSlot` del `AvatarContext`, el `AvatarSprite` debe renderizarse en su interior.

## Archivos a crear o modificar
- `apps/web/src/components/avatar/avatar-slot.tsx`

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/web/src/components/avatar/avatar-slot.spec.tsx`
- Tipo: Componente/Integración.
- Qué debe probar:
  - Si el contexto dice que el slot actual es 'A', el `<AvatarSlot id="A" />` renderiza children/sprite.
  - El `<AvatarSlot id="B" />` NO renderiza nada.
- Assertions: Presencia/ausencia de nodos en el DOM.

## Criterios de finalización
- [ ] Componente `AvatarSlot` implementado aceptando un prop `id: string`.
- [ ] Utiliza `useAvatar` para comprobar si `currentSlot === id`.
- [ ] Si coinciden, renderiza el componente `AvatarSprite` en su interior. En caso contrario, renderiza `null` (o un placeholder invisible con el mismo tamaño si se quiere preservar el espacio).

## Notas Técnicas
- Para evitar saltos abruptos (CLS - Cumulative Layout Shift), considera que el `AvatarSlot` debe tener dimensiones fijas idénticas a las del sprite incluso cuando está vacío, o utilizar estrategias de posicionamiento absoluto si el diseño lo dictamina. Para AgentRepo, asume dimensiones fijas en línea (ej. `w-8 h-8` o `w-10 h-10`).
