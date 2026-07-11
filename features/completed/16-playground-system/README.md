# Feature 16: Playground System

## Meta
- **Número:** 16
- **Fase:** Fase 4 — Portfolio y Playground
- **Objetivo detallado:** Diseñar una experiencia interactiva premium tipo "Trello de Agentes IA" en `/playground`. El visitante interactúa con una pizarra de tareas Kanban donde los subagentes autónomos asumen tareas, realizan código en directo, corren tests (con simulación de errores y correcciones), y permiten previsualizar y desplegar características en tiempo real. Soporta un flujo simulado pre-configurado y un flujo real impulsado por IA mediante tokens de acceso.
- **Dependencias:** 02-fundacion-core-components, 04-fundacion-avatar-system.

## Alcance
- Pizarra Kanban interactiva (Columnas: Backlog, Desarrollar, Testing, Review, Deploy).
- Integración con el avatar como guía del flujo de demostración.
- Módulos de cards altamente reutilizables para el flujo mockeado y el flujo real.
- Modo simulado guiado con test fallidos y refactorizaciones automáticas.
- Modo real IA que consume streaming SSE del backend con un token de acceso, permitiendo al usuario crear features personalizadas y ver al agente codificarlas y probarlas.

## Lista de Tasks
1. `task-1-tokens-admin-backend.md`: Base de datos de tokens de acceso y rate limiting.
2. `task-2-playground-board-ui.md`: Interfaz visual de la pizarra Trello y componentes de tarjetas reutilizables.
3. `task-3-playground-mock-flow.md`: Lógica y animaciones del flujo simulado paso a paso.
4. `task-4-playground-real-flow.md`: Integración real con el backend de orquestación de agentes en streaming.
