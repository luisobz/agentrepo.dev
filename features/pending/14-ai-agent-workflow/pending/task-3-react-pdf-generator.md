# Task 3: Generador PDF de CV Dinámico

## Descripción
Crear el componente React (lado servidor) que renderizará un PDF con `@react-pdf/renderer` para adjuntarlo en respuestas automáticas.

## Criterios de finalización
- [ ] `packages/infrastructure/src/pdf/cv-template.tsx` creado usando primitivas de `@react-pdf/renderer` (`Document`, `Page`, `Text`).
- [ ] Servicio que renderiza el componente a un Buffer de PDF en Node.js de forma síncrona/promesa.
