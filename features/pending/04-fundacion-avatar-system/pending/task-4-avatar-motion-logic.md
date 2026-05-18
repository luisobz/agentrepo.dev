# Task 4: Lógica de traslación (Motion)

## Descripción
El cambio brusco de un slot a otro puede sentirse roto o tosco. Esta tarea busca añadir una transición fluida al avatar cuando salta entre slots. Usaremos Framer Motion para lograr un `layout` animation, permitiendo que el avatar vuele o transicione suavemente de un punto A a un punto B en el DOM.

## Archivos a crear o modificar
- `apps/web/src/components/avatar/avatar-sprite.tsx` (Refactor para incluir motion).
- Modificaciones en `AvatarSlot` si fuera necesario para LayoutGroup.
- `package.json` (Añadir `framer-motion` si no existe).

## Tests que deben escribirse ANTES de implementar
- Archivo: Manual o E2E visual (las animaciones son complejas de testear en unit tests puros).

## Criterios de finalización
- [ ] Al cambiar el estado de `currentSlot`, el Avatar no desaparece y reaparece instantáneamente, sino que se anima espacialmente de un lado a otro.
- [ ] El componente usa `<motion.div layoutId="avatar-sprite">` u otro mecanismo de Framer Motion.

## Notas Técnicas
- El uso de `layoutId` en Framer Motion permite animar un componente entre diferentes partes del árbol de React sin necesidad de portales complejos, siempre y cuando se rendericen secuencialmente (cuando el slot A se desmonta, el slot B se monta).
- Configura el `transition` para que sea un spring suave pero rápido (`type: 'spring', stiffness: 300, damping: 30`), no debe entorpecer la navegación.
