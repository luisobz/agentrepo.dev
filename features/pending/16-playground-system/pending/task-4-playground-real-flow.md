# Task 4: Integración Real IA en Streaming (Real Agent Flow Engine)

## Descripción
Implementar el motor real del Playground impulsado por IA. En este modo (que requiere un token de acceso válido), el usuario no está limitado a features mockeadas, sino que puede **crear un requerimiento técnico personalizado escribiendo un prompt** (ej. "Crear un formulario de perfil con subida de avatar"). Los subagentes en el backend procesarán el prompt en tiempo real, generarán el código real, correrán pruebas reales con ciclos de autocorrección (self-healing), streamearán el progreso a la pizarra Trello del frontend, y permitirán ver y probar el código interactivo generado antes de desplegarlo.

## Archivos a crear o modificar
- `apps/web/src/modules/web-workflow-agent/hooks/use-playground-real.ts` (Hook de control real).
- `packages/application/src/playground/use-cases/execute-agent-flow.use-case.ts` (Caso de uso del orquestador en backend).
- `packages/trpc/src/lib/routers/playground.router.ts` (Endpoint tRPC con soporte para streaming / suscripciones).
- `apps/web/src/modules/web-workflow-agent/components/playground-board.tsx` (Vincular el flujo real).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `packages/application/src/playground/use-cases/execute-agent-flow.use-case.spec.ts`
- Qué debe probar:
  1. Invocar el caso de uso inyectando mocks del LLM (`LLMServicePort`) y verificar que se genera un stream de eventos estructurado (`coder`, `tester`, `self-healing`, `review`).
  2. Si el test suite mockeado de backend reporta un fallo de sintaxis, verificar que el caso de uso vuelve a llamar al LLM inyectando el código erróneo y el stack trace para repararlo automáticamente.

## Criterios de finalización
- [ ] **Creación de Features Personalizadas:**
  - El usuario puede escribir un prompt y al hacer clic en "+ Crear Feature", se añade una nueva tarjeta al Backlog con su título y prompt.
  - La tarjeta se mueve automáticamente a **Desarrollar** y valida el token en el backend.
- [ ] **Orquestación en backend (Self-Healing Loop):**
  - El backend (`backend-web`) invoca a DeepSeek V4 mediante LangChain de forma estructurada para:
    1. **CoderAgent:** Diseñar e implementar el componente React/TypeScript.
    2. **TesterAgent:** Escribir y ejecutar pruebas unitarias. Si fallan, reenvía automáticamente el código fallido y el error de compilación al CoderAgent (bucle de autocorrección de hasta 2 reintentos).
- [ ] **Streaming en Tiempo Real (tRPC / Server-Sent Events):**
  - El progreso se streamea al frontend en tiempo real. La tarjeta Trello se mueve físicamente por el tablero, actualizando las sub-tareas y mostrando en directo el código que se va generando en un visor Monaco read-only en el card o en una barra de progreso.
- [ ] **Previsualización Interactiva Real del Código:**
  - En la columna **Review**, al hacer click en "Ver Previsualización", el frontend renderiza el código generado (utilizando un renderizador dinámico seguro, un visor de código estructurado interactivo o un sandbox minimalista) permitiendo al usuario probar la característica real construida por la IA.
- [ ] **Deploy Real (Persistencia):**
  - Al hacer click en "Deploy", se simula el despliegue del componente y se guarda permanentemente en la base de datos PostgreSQL, asignándole una URL de subdominio ficticia (ej. `https://custom-profile-form.agentrepo.dev`).
