# Feature 01: Fundación del Design System

## Meta
- **Número:** 01
- **Fase:** Fase 1 — Fundación visual y estructural
- **Objetivo detallado:** Establecer la base visual unificada para AgentRepo.dev implementando Tailwind CSS v4, cargando las tipografías principales (Geist y Geist Mono) y definiendo todos los design tokens (colores, sombras, espaciado, bordes) requeridos por el diseño original en el paquete centralizado de configuración.

## Alcance
- **Incluye:**
  - Configuración global de Tailwind v4 en el monorepo.
  - Carga y configuración de fuentes locales (`Geist`, `Geist Mono`).
  - Creación del archivo `globals.css` base en el paquete `ui`.
  - Definición de todas las variables CSS para los colores principales (marfil, granate, azul, etc.).
  - Definición de tokens para el modo consola (sección agents).
  - Configuración de sombras, bordes y espaciados básicos.
- **NO incluye:**
  - Creación de componentes UI de React (botones, inputs, cards). Esto es para la feature 02.
  - Configuración de utilidades complejas de Tailwind que no vengan por defecto.
  - Generación de animaciones o motion.

## Criterios de Aceptación
1. Las apps (`web`, `admin`) deben poder importar y usar clases de Tailwind de forma correcta sin errores de compilación.
2. Las fuentes `Geist` y `Geist Mono` se cargan correctamente sin parpadeos y están disponibles vía variables CSS (ej. `var(--font-geist)` o sus respectivas utilidades en Tailwind).
3. Existen utilidades de Tailwind autocompletables para los colores personalizados de la marca (ej. `bg-brand-garnet`, `text-bg-base`, `border-border-soft`).
4. Existen utilidades para el espaciado y radios según el especificado en `design-system.md` (ej. `rounded-xl`, `shadow-garnet`).
5. El background base se aplica correctamente.

## Dependencias
- Ninguna.

## Componentes del sistema implicados
- `packages/config` (donde probablemente resida la config base de Tailwind o ESLint si afecta).
- `packages/ui` (donde residirán los estilos globales CSS).
- `apps/web` y `apps/admin` (para asegurar la importación y carga de la fuente/css en el layout principal).

## Reglas de Negocio Relevantes
- Todo el styling *debe* realizarse mediante utilidades de Tailwind usando variables del Design System. No se usarán variables genéricas a menos que se mapeen explícitamente.
- El modo oscuro *no* se contempla, la base siempre será el tema claro (`Ivory`).
- Las tipografías deben ser auto-alojadas (self-hosted) o usar `next/font` para prevenir FOUT/FOIT y CLS.

## Consideraciones Técnicas
- AgentRepo utiliza **Tailwind CSS v4**. En v4, la configuración se maneja directamente en los archivos CSS mediante directivas como `@theme`, reduciendo la necesidad del antiguo archivo `tailwind.config.ts`.
- La arquitectura monorepo implica que el archivo CSS central (`globals.css`) debe ser alojado en un paquete compartido, preferiblemente `packages/ui/src/styles/globals.css`, y luego importado en los layouts principales de las aplicaciones Next.js.
- Evitar instalar Tailwind en cada app separadamente si es posible tener un manejo unificado a nivel paquete en v4. Si las apps lo requieren, asegurar que leen de una fuente común.

## Lista de Tasks
1. `task-1-tailwind-config.md`: Configuración de Tailwind CSS v4 en el monorepo.
2. `task-2-tipografia-fuentes.md`: Integración de tipografías Geist y Geist Mono.
3. `task-3-tokens-css-globales.md`: Traducción de paleta de colores y variables CSS al Design System.
