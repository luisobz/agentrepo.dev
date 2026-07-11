# Task 3: Casos de Uso de Agentes

## Descripción
Lógica de creación y recuperación. Al crear/actualizar un Agente, la capa de aplicación debe validar que el FileTree provisto sea correcto (que los paths cuadren, no haya duplicados en el mismo nivel).

## Criterios de finalización
- [ ] `CreateAgentUseCase` y `UpdateAgentUseCase` validan la estructura del árbol antes de enviar al Port.
- [ ] Tests unitarios rigurosos sobre la validación del árbol (ej. detectar fichero sin nombre, tipos inválidos).
