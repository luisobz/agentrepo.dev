# Task 3: Conexión de Submit en Frontend (Portfolio Form)

## Descripción
Conectar el formulario visual del portfolio (`web-portfolio`) con la mutación real de tRPC. Al procesar el submit, el frontend debe interactuar de forma intuitiva con el usuario, mostrando estados visuales claros y toasts estéticos.

## Archivos a crear o modificar
- `apps/web/src/modules/web-portfolio/components/contact-form.tsx` (Actualizar e integrar lógica).
- `apps/web/src/modules/web-portfolio/hooks/use-portfolio-contact.ts` (Hook opcional o integrado).

## Criterios de finalización
- [ ] Integrar `react-hook-form` con validación schema `zod` mapeado al validador de tRPC.
- [ ] Disparar la mutación tRPC `trpc.contact.submit.useMutation()`.
- [ ] **Experiencia de Usuario (UX/UI):**
  - **Estado Loading:** El botón de enviar cambia a un spinner elegante con texto "Procesando..." y los campos del formulario se deshabilitan temporalmente.
  - **Éxito (Success):** Se muestra un Toast estético de confirmación: *"¡Mensaje recibido! El Agente IA ha comenzado el análisis. Recibirás un email interactivo pronto."*
  - **Reseteo:** Limpiar los campos del formulario tras el éxito.
