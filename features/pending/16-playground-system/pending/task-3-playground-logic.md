# Task 3: Lógica Dummy vs Streaming

## Descripción
Permitir que el usuario experimente la sensación del agente sin gastar créditos de LLM reales, y habilitar el modo real si el Token existe y es válido.

## Criterios de finalización
- [ ] Si se usa sin Token (Dummy Mode): el sistema detecta inputs genéricos, simula delay de "thinking" y devuelve una respuesta pre-codificada en intervalos (`setInterval`) para simular stream.
- [ ] Si se usa con Token válido: usa `fetch` para consumir un Server Sent Events (SSE) o stream del `backend-web`, el cual delega a DeepSeek para respuesta real del agente con LangChain.
