# Feature 02: Fundación de Core Components

## Meta
- **Número:** 02
- **Fase:** Fase 1 — Fundación visual y estructural
- **Objetivo detallado:** Implementar los componentes base de UI usando `shadcn/ui` y construyendo los componentes personalizados necesarios para la web pública y el panel de administración, ajustándolos exactamente a los tokens definidos en el Design System (Feature 01).

## Alcance
- **Incluye:**
  - Configuración e inicialización de `shadcn/ui` en el paquete `@agentrepo/ui`.
  - Implementación de Botones (Primario Granate, Secundario, Ghost/Link).
  - Implementación de Inputs de texto y búsqueda.
  - Implementación de Cards base y Cards Técnicas (con modo consola).
  - Implementación de Chips y Tags para categorizar Skills y Agentes.
- **NO incluye:**
  - Componentes de layout complejos (Hero, Headers, Navegación).
  - Lógica de búsqueda global o funcionalidad en los inputs.
  - El sistema del Avatar (esto corresponde a la Feature 04).

## Criterios de Aceptación
1. Todos los componentes de React requeridos están creados en `packages/ui/src/components/base` o `packages/ui/src/components/ds`.
2. Las aplicaciones `apps/web` y `apps/admin` pueden importar los componentes directamente de `@agentrepo/ui`.
3. Los botones reflejan los estilos definidos: fondo granate `--brand-garnet`, hover profundo `--brand-garnet-deep` y sombras `--shadow-garnet`.
4. Los Chips tienen las variantes exactas estipuladas en el diseño (prompt, system, persona, template, config) usando tipografía Geist Mono.
5. Los Cards tienen borde sutil, fondo cálido, y variante técnica con `--console-bg` y tipografía mono.

## Dependencias
- Requiere **Feature 01** (Tokens y configuración de Tailwind CSS).

## Componentes del sistema implicados
- `packages/ui` (Librería de componentes).
- `apps/web` y `apps/admin` (Para validar consumo).

## Reglas de Negocio Relevantes
- El diseño debe sentirse "premium" y técnico. Sin colores genéricos.
- La librería subyacente será shadcn/ui pero modificada fuertemente para no verse como un "tema por defecto".
- Las variantes de color de los chips indican el tipo de recurso; deben respetar escrupulosamente los colores de fondo, texto y bordes definidos.

## Consideraciones Técnicas
- Se debe asegurar que Nx permita importar el paquete `@agentrepo/ui` sin problemas.
- `shadcn/ui` suele instalar sus dependencias en `components.json`. Configúralo para que las rutas apunten a `packages/ui/src/...` en lugar de una app específica.
- Usa `cva` (Class Variance Authority) y `tailwind-merge` (integrados en shadcn) para manejar las variantes (ej. primary, secondary, ghost en botones).

## Lista de Tasks
1. `task-1-shadcn-setup.md`: Inicialización de shadcn/ui.
2. `task-2-componentes-botones.md`: Botones primarios, secundarios y ghost.
3. `task-3-componentes-inputs-cards.md`: Entradas de texto y contenedores Card.
4. `task-4-componentes-tags-chips.md`: Etiquetas categorizadoras y chips técnicos.
