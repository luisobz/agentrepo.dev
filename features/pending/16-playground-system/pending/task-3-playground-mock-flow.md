# Task 3: Lógica y Animaciones del Flujo Simulado (Mock Flow Engine)

## Descripción
Crear el motor lógico de simulación local del Playground en `apps/web`. Esta simulación guiará paso a paso al usuario a través del ciclo de vida del desarrollo agéntico autónomo mediante una máquina de estados simulada, disparando transiciones automáticas en la pizarra Trello y cambiando las emociones y diálogos del avatar guía.

## Archivos a crear o modificar
- `apps/web/src/modules/web-workflow-agent/hooks/use-playground-mock.ts` (Hook del motor de simulación).
- `apps/web/src/modules/web-workflow-agent/components/playground-board.tsx` (Vincular la simulación).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `apps/web/src/modules/web-workflow-agent/hooks/use-playground-mock.spec.ts`
- Qué debe probar:
  1. Inicializar el hook con las 3 features por defecto bloqueadas en el Backlog:
     - *"Feature 1: Premium Dark Hero Page"*
     - *"Feature 2: Secure GitHub OAuth Flow"*
     - *"Feature 3: High-Performance Redis Caching"*
  2. Mover una tarjeta de Backlog a "Develop" y verificar que el estado inicia la simulación del CoderAgent.
  3. Ejecutar los ciclos de reloj ficticios (timers) y verificar que la máquina de estados transiciona a "Testing", luego falla (vuelve a "Develop") y finalmente pasa a "Review".

## Criterios de finalización
- [ ] **Tres Features Base Inmutables:**
  - El backlog inicial tiene siempre 3 tarjetas predefinidas no editables.
- [ ] **Paso 1: Desarrollar (Simulación Coder):**
  - Al arrastrar a **Desarrollar**, el avatar global cambia a `thinking` y su banner dice: *"CoderAgent asumiendo la tarea. Escribiendo código y componentes..."*
  - Un timer va completando de forma animada la lista de sub-tareas.
- [ ] **Paso 2: Testing y Falla del Test:**
  - Tras 3 segundos, la tarjeta viaja sola a **Testing**.
  - Asigna al `[TesterAgent]`. Corre tests de integración.
  - **Simulación de error:** A los 2 segundos, el test de aserción falla visualmente. El avatar exclama: *"¡Ups! La aserción de seguridad ha fallado. Reenviando al Coder para refinar el bug..."*
  - La tarjeta se tiñe de rojo y regresa automáticamente a **Desarrollar** durante 2 segundos para su "refactorización".
- [ ] **Paso 3: Éxito en Testing y Review:**
  - La tarjeta regresa a **Testing**, pasa los tests satisfactoriamente ("✓ Tests passed") y viaja a **Review**.
  - Se habilita el botón "Ver Previsualización".
- [ ] **Previsualización Realista e Interactiva:**
  - Al hacer click en "Ver Previsualización", se renderiza un preview funcional ficticio basado en la feature (ej: si es la Landing Page Oscura, muestra una mini landing interactiva real y estética en un modal).
- [ ] **Paso 4: Deploy Exitoso:**
  - Al clickear "Deploy", se inicia un loading de 1.5 segundos ("Desplegando en Spaceship...") y culmina con un mensaje de éxito ("Deploy exitoso"), confeti visual y el avatar en pose feliz (`happy`).
