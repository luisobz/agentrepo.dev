# Task 4: Workflow Orchestrator (Backend AI)

## Descripción
Construir el controlador REST interno que amarra LangChain, la validación de email, el PDF y SMTP en un solo flujo.

## Criterios de finalización
- [ ] Endpoint `POST /internal/contact` en `backend-ai`.
- [ ] Validar con Guard rails que la consulta no sea inyección de prompt o spam severo (usando un prompt simple previo o regex).
- [ ] Ejecutar el flujo: 1. Llamar a DeepSeek para formular la respuesta, 2. Generar el PDF, 3. Enviar email de confirmación/respuesta al usuario. 4. Enviar copia a `hola@luisbz.com`.
- [ ] Observabilidad total en Langfuse de cada paso.
