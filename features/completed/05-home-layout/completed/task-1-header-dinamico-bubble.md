# Task 1: Header Dinámico "Bubble"

## Descripción
Implementar el header principal de navegación para `apps/web`. En la carga inicial de página o scroll 0, el header tiene un padding holgado y está integrado en el layout. Al hacer scroll hacia abajo, el header se despega del flujo normal, se adhiere a la parte superior central (fixed/sticky) reduciendo su tamaño y aplicando un efecto `backdrop-blur` (glassmorphism) parecido a una "burbuja".

## Archivos a crear o modificar
- `apps/web/src/components/layout/header.tsx`
- `apps/web/src/app/layout.tsx` (Añadir el Header).

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/web/src/components/layout/header.spec.tsx`
- Tipo: Componente.
- Qué debe probar:
  - El componente renderiza links de navegación por defecto (Home, Skills, Agents, Blog).
  - Al simular un mock de scroll, el componente añade las clases CSS de colapso o vidrio.
- Assertions: Verificación de presencia de clases.

## Criterios de finalización
- [ ] `Header` implementado como Client Component para poder leer window scroll o usar `framer-motion`.
- [ ] La navegación incluye: `/skills`, `/agents`, `/blog` (y quizás link a la Home).
- [ ] Aplicado glassmorphism al hacer scroll (`bg-white/70 backdrop-blur-md` adaptado a los colores de la marca, ej. `--bg-surface` con opacidad).
- [ ] En móvil, la burbuja se adapta sin salirse de la pantalla.

## Notas Técnicas
- Para optimizar el rendimiento y evitar re-renders excesivos en React, usa el hook `useScroll` de Framer Motion junto con `useTransform` y `<motion.header>`, o un listener de scroll en useEffect que haga throttle/debounce para togglear un boolean de estado `isScrolled`.
