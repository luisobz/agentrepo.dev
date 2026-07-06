# Feature 05: Home Page Layout y Dinámicas

## Meta
- **Número:** 05
- **Fase:** Fase 2 — Home y Skills
- **Objetivo detallado:** Maquetar la página pública principal (Home) según el diseño. Debe servir como la puerta de entrada, con un layout espacioso de dos columnas lógicas, el componente del header dinámico ("Bubble") y los slots base para el Avatar y el futuro buscador FTS.

## Alcance
- **Incluye:**
  - Header global que colapsa en formato "bubble" al hacer scroll vertical.
  - Fondo general con patrón sutil (ruido o grid) y viñeta.
  - Layout central principal (Hero text y buscador principal).
  - Sección inferior "Latest" con tarjetas referenciando contenido mockeado.
- **NO incluye:**
  - Lógica funcional del buscador (Feature 06).
  - Listado real de datos desde BD (se mockeará por ahora).

## Criterios de Aceptación
1. La ruta `/` renderiza el nuevo layout en Next.js App Router reemplazando el default.
2. Al scrollear hacia abajo, la navegación superior se condensa en un pill/bubble centrado en la parte superior de la pantalla, con un fondo cristalino (`backdrop-blur`).
3. El layout es plenamente responsivo (columna única en mobile, distribución amplia en desktop).
4. El Avatar se inicializa en el slot principal del hero al cargar la Home.

## Dependencias
- Requiere **Feature 02** (Componentes).
- Requiere **Feature 04** (Avatar context/slots).

## Componentes del sistema implicados
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/layout.tsx` (Para el Header global).
- `apps/web/src/components/layout/header.tsx`

## Reglas de Negocio Relevantes
- La Home no es un dashboard, es un "cover" editorial. El foco absoluto es la barra de búsqueda y el statement de intenciones.
- El Avatar debe guiar la mirada, empezando cerca del input de búsqueda.

## Consideraciones Técnicas
- El header de burbuja (`header.tsx`) debe escuchar el evento de scroll window para cambiar sus estilos o variantes (usar `useEffect` o Framer Motion `useScroll`).
- Next.js 16 (React 19) server/client boundaries deben respetarse. El header dinámico necesitará `"use client"` mientras que la estructura de la home debe ser Server Component.

## Lista de Tasks
1. `task-1-header-dinamico-bubble.md`: Componente de header y scroll.
2. `task-2-home-hero-layout.md`: Hero, text styling y layout de buscador.
3. `task-3-home-latest-section.md`: Grilla inferior de contenido.
4. `task-4-home-background-gradient.md`: Fondo con ruido/viñeta.
