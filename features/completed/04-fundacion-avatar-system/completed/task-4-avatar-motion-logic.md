# Task 4: Lógica de traslación (Motion)

## Descripción
El cambio brusco de un slot a otro puede sentirse tosco. Esta tarea busca añadir una transición fluida al avatar cuando salta entre slots. Usaremos Framer Motion para lograr un `layout` animation, permitiendo que el avatar vuele o transicione suavemente de un punto A a un punto B en el DOM.

## Archivos a crear o modificar
- `apps/web/src/modules/shared/avatar/avatar-sprite.tsx` (Refactor para incluir motion).
- `apps/web/src/modules/shared/avatar/avatar-slot.tsx` (Añadir wrappers si fuera necesario).
- `package.json` (Asegurar que `framer-motion` está instalado en las dependencias).

## Tests que deben escribirse ANTES de implementar
- Las transiciones complejas de animaciones espaciales se verifican mejor de forma visual o mediante tests de integración/E2E con Cypress/Playwright. Se requiere comprobar que no existan errores de montado de React.

## Criterios de finalización
- [ ] Al cambiar el estado de `currentSlot`, el Avatar no desaparece y reaparece instantáneamente, sino que se anima espacialmente de un lado a otro.
- [ ] El componente visual en `avatar-sprite.tsx` utiliza `<motion.div layoutId="avatar-sprite">` u otro mecanismo de Framer Motion para el transporte suave.
- [ ] La animación usa una configuración spring amortiguada para evitar oscilaciones excesivas y garantizar alta calidad estética (`type: 'spring', stiffness: 300, damping: 30`).

## Notas Técnicas
- El uso de `layoutId` en Framer Motion permite animar un componente entre diferentes partes del árbol de React sin necesidad de portales complejos, siempre y cuando se rendericen secuencialmente (cuando el slot A se desmonta, el slot B se monta).
