# Feature 14: AI Agent Workflow (Backend AI)

## Meta
- **Número:** 14
- **Fase:** Fase 4 — Portfolio y Playground
- **Objetivo detallado:** Configurar `backend-ai` para procesar el workflow de contacto del portfolio usando LangChain, DeepSeek V4, Langfuse (observabilidad), generador de PDF y envío SMTP.

## Alcance
- **Incluye:**
  - Integración `@langchain/openai` apuntando a DeepSeek.
  - Setup de Langfuse para tracing.
  - Servicio de `Spacemail` (Nodemailer) para enviar correos.
  - Generación de PDF en memoria usando `@react-pdf/renderer` en servidor.
  - Exposición de un endpoint REST POST `/internal/workflow/contact`.

## Dependencias
- `backend-ai` debe tener variables de entorno configuradas (`DEEPSEEK_API_KEY`, `LANGFUSE_*`, `SPACEMAIL_*`).

## Lista de Tasks
1. `task-1-langchain-deepseek-adapter.md`: Setup LangChain y Langfuse.
2. `task-2-spacemail-smtp-adapter.md`: Módulo de correos.
3. `task-3-react-pdf-generator.md`: Plantilla PDF de CV dinámico.
4. `task-4-workflow-orchestrator.md`: Orquestar todo el flujo asíncrono.
