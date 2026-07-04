# Feature 04: Avatar System Foundation

## Meta
- **Número:** 04
- **Fase:** Fase 1 — Fundación visual y estructural
- **Objetivo detallado:** Implementar la lógica, el contexto y la renderización del Avatar, la "mascota" de la web. El sistema del avatar permite renderizar sus sprites en "slots" determinados, pero el estado y animación están globalmente gestionados. El avatar puede saltar entre distintas áreas de la interfaz en base a las acciones del usuario.

## Alcance
- **Incluye:**
  - `AvatarProvider` y Contexto para mantener el estado global del avatar (posición actual, emociones/variantes de sprite).
  - Componente de renderizado de sprite `AvatarSprite` (que reacciona a los frames o animaciones sutiles).
  - Componente `AvatarSlot` que actúa como contenedor "target" en el layout donde el avatar puede habitar temporalmente.
  - Funciones auxiliares o hooks (`useAvatar`) para cambiar su posición.
- **NO incluye:**
  - El huevo de pascua (Easter egg logic) final que lleva al portfolio (Eso es de la feature 17).
  - Lógica específica de la página de agentes, sólo la base mecánica y slots de prueba.

## Criterios de Aceptación
1. Existe un contexto global accesible por toda la aplicación Next.js.
2. Puedo tener múltiples `<AvatarSlot id="header" />` y `<AvatarSlot id="footer" />` en la página.
3. Llamar a `setAvatarPosition('footer')` hace que el sprite desaparezca del header y aparezca en el footer.
4. El cambio de slot puede tener (opcional y secundariamente) motion sutil o reaccionar de forma inmediata y el componente sprite en sí renderiza correctamente sus colores o SVG.
5. El avatar utiliza los colores corporativos y se alínea con la marca.

## Dependencias
- Requiere **Feature 01** (Colores/Tokens).

## Componentes del sistema implicados
- `packages/ui` o `apps/web/components` (Recomendable en `apps/web/components/avatar` si el admin no lo usa, pero si se quiere genérico, en `@agentrepo/ui`).
- `apps/web` (Layout y páginas para consumo).

## Reglas de Negocio Relevantes
- El avatar es un identificador de la web, debe estar presente como guía, no como un robot intrusivo de chat.
- "Menos es más". Sus animaciones deben ser pasivas e interacciones cortas y deliberadas.

## Consideraciones Técnicas
- El enfoque más eficiente en React para mover un componente entre distintas partes del DOM (los slots) sin perder su estado interno suele ser el uso de **React Portals** (`createPortal`) al elemento contenedor, o bien usar Framer Motion (`layoutId` u otros) si los contenedores siempre están montados. Por ahora la especificación sugiere un Contexto Global.
- Como mínimo, tener sprites estáticos SVG o CSS art puro definidos como el diseño.

## Lista de Tasks
1. `task-1-avatar-context-provider.md`: Estado global del avatar.
2. `task-2-avatar-sprite-component.md`: Renderizado visual del personaje.
3. `task-3-avatar-slot-component.md`: Contenedores dinámicos.
4. `task-4-avatar-motion-logic.md`: Lógica de traslación entre slots.
