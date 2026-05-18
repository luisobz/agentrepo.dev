# Task 4: Background Global, Viñeta y Ruido

## Descripción
Para conseguir la calidad "premium" estipulada, la web no debe tener simplemente un fondo de color plano. Debe implementar un gradiente sutil, una ligera viñeta (bordes ligeramente más oscuros) o un leve patrón de ruido (grain) que enriquezca la textura visual sin distraer.

## Archivos a crear o modificar
- `packages/ui/src/styles/globals.css` o `apps/web/src/app/layout.tsx`.
- (Opcional) Un SVG estático en public para el ruido de fondo.

## Tests que deben escribirse ANTES de implementar
- Archivo: Visual E2E (difícil de testear en unitario).

## Criterios de finalización
- [ ] El fondo de la aplicación Next.js no es de color sólido 100%, incluye una textura visual sutil.
- [ ] Esta textura se percibe al inspeccionar el DOM pero no entorpece la lectura ni baja el contraste del texto por debajo de los estándares WCAG.
- [ ] La performance no se ve penalizada (usar CSS noise o SVGs muy pequeños repetidos, no gifs pesados).

## Notas Técnicas
- El ruido de fondo puede lograrse en CSS con un SVG base64 en `background-image` o mediante una mezcla de `<svg>` + `<filter type="fractalNoise">` con un pseudo-elemento fijo en el fondo que tenga `pointer-events: none` y `mix-blend-mode: overlay`.
- Ten precaución de poner opacidades muy bajas (ej. `0.02` o `0.05`) para el ruido.
- La viñeta puede ser una capa superior fija con un `box-shadow: inset 0 0 100px rgba(...)`.
