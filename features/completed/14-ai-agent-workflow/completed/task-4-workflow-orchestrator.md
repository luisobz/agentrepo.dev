# Task 4: Workflow Orchestrator (Backend AI Controller)

## Descripción
Orquestar todo el flujo asíncrono en `backend-ai`. Se creará un caso de uso de aplicación que integre todos los puertos (`LLMServicePort`, `PDFGeneratorPort`, `EmailServicePort`) y se expondrá a través de un controlador REST interno en `backend-ai` de NestJS.

## Archivos a crear o modificar
- `packages/application/src/portfolio/use-cases/process-contact-workflow.use-case.ts` (Lógica de aplicación).
- `apps/backend-ai/src/app/controllers/contact-workflow.controller.ts` (Controlador REST).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `packages/application/src/portfolio/use-cases/process-contact-workflow.use-case.spec.ts`
- Qué debe probar:
  1. Invocar el caso de uso con mocks de los puertos.
  2. Verificar que se ejecuta secuencialmente: 1. Llamar al LLM, 2. Generar el PDF adjuntando el análisis, 3. Enviar el correo con Nodemailer.

## Criterios de finalización
- [ ] Implementar el caso de uso `ProcessContactWorkflowUseCase`.
- [ ] **Flujo de Ejecución:**
  1. **Prompt Guardrail:** Valida sutilmente con una regex o prompt rápido que el mensaje del remitente no sea spam severo o un ataque de inyección.
  2. **Análisis por IA:** Envía el email y mensaje del usuario a DeepSeek V4 (`DeepSeekLLMService`) para formular una respuesta rica y encaje del perfil de Luis.
  3. **Generación PDF:** Pasa el resultado de la IA al generador de PDF para obtener el buffer en memoria.
  4. **Envío de Emails:** Envía un email al remitente con el PDF adjunto. Envía inmediatamente una copia oculta o reporte de notificación a `hola@luisbz.com` para avisar a Luis.
- [ ] **Controlador REST:**
  - Expone un endpoint `POST /internal/workflow/contact` protegido por una clave secreta local (Header `x-internal-key`) que inyecta los datos.
  - Retorna `202 Accepted` de inmediato de manera que el emisor no quede colgado esperando.
