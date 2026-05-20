# Task 2: Timeline Interactivo (Recorrido Profesional)

## Descripción
Crear el componente que muestra la trayectoria profesional (experiencia, estudios, logros clave en IA/Fullstack). La línea de tiempo debe ser altamente interactiva y visualmente premium.

## Archivos a crear o modificar
- `apps/web/src/modules/web-portfolio/components/portfolio-timeline.tsx`

## Criterios de finalización
- [ ] Implementar el componente `PortfolioTimeline` en `apps/web/src/modules/web-portfolio/components/portfolio-timeline.tsx`.
- [ ] **Diseño Visual:**
  - Una línea central o lateral vertical continua en color tenue (ej. `--brand-garnet-muted` o un gradiente suave).
  - Puntos de anclaje (nodos) activos que se iluminan al pasar el ratón.
  - Cada ítem contiene: Período de tiempo (ej. 2024 - Presente), Título del cargo, Nombre de la empresa, descripción corta de logros (ej. "Líder técnico en automatización con agentes autónomos").
- [ ] **Interactividad:**
  - Hover dinámico que resalta la tarjeta de la experiencia seleccionada (aumentando la opacidad, escalando sutilmente la tarjeta y cambiando el color del nodo de la línea temporal).
  - Uso de Framer Motion para entradas suaves al hacer scroll (`whileInView` o `viewport={{ once: true }}`).

## Notas Técnicas
- Estructura los datos del timeline en una constante local tipada para facilitar la edición o escalabilidad en el futuro.
- Evita saturar la pantalla; mantén las descripciones concisas enfocadas en impacto cuantificable (ej. "Reducción de costes de API en un 30%").
