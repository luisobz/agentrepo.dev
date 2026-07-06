# Task 1: Setup LangChain y Adaptador de DeepSeek V4

## Descripción
Implementar el puerto y adaptador de infraestructura en `packages/application` y `packages/infrastructure` para invocar al LLM DeepSeek V4 utilizando LangChain (`@langchain/openai`) y registrar/trazar la ejecución de forma nativa en Langfuse utilizando callbacks.

## Archivos a crear o modificar
- `packages/application/src/portfolio/ports/llm-service.port.ts` (Interface del puerto).
- `packages/infrastructure/src/ai/deepseek/deepseek-llm.service.ts` (Adaptador concreto).
- `packages/infrastructure/src/index.ts` (Exportar el servicio).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `packages/infrastructure/src/ai/deepseek/deepseek-llm.service.spec.ts`
- Tipo: Integración / Mock de integración.
- Qué debe probar:
  1. Instanciar el servicio inyectando mocks de las variables de entorno.
  2. Llamar a la función principal del puerto (ej. `generateResponse(email, message)`) y verificar que llama adecuadamente al cliente ChatOpenAI.
  3. Comprobar que se adjuntan las trazas de callback si Langfuse está configurado.

## Criterios de finalización
- [ ] Interface `LLMServicePort` definida con un método `generateResponse(senderEmail: string, messageContent: string): Promise<string>`.
- [ ] Adaptador `DeepSeekLLMService` en `packages/infrastructure` implementando `LLMServicePort`.
- [ ] Instancia internamente `ChatOpenAI` configurando:
  - `configuration.baseURL`: `https://api.deepseek.com/v1` (o la URL provista por ENV).
  - `apiKey`: `process.env.DEEPSEEK_API_KEY`.
  - `modelName`: `deepseek-chat` (DeepSeek V4).
  - `temperature`: `0.3` (para consistencia técnica).
- [ ] Configura y acopla `LangfuseCallbackHandler` de `@langfuse/default` o `@langfuse/langchain` utilizando las variables de entorno globales `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` y `LANGFUSE_HOST`.

## Notas Técnicas
- El prompt del sistema debe ser altamente instructivo: debe analizar la consulta de contacto, redactar una respuesta profesional simulando ser el asistente virtual de Luis, y estructurar sugerencias clave basadas en el propósito del contacto.
