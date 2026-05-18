# Task 1: Setup LangChain y DeepSeek V4

## Descripción
Implementar el adaptador de infraestructura en `backend-ai` para invocar al LLM DeepSeek V4 utilizando la abstracción de LangChain y trazar la ejecución con Langfuse.

## Criterios de finalización
- [ ] `packages/infrastructure/.../langchain.adapter.ts` o equivalente.
- [ ] Instanciación de `ChatOpenAI` configurado con la base URL de DeepSeek (`https://api.deepseek.com/v1`) y su API Key.
- [ ] Configuración del `LangfuseCallbackHandler` inyectado en las llamadas del modelo.
- [ ] Test unitario que simula una respuesta del LLM.
