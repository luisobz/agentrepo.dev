# Task 4: Formulario de Contacto UI

## Descripción
Crear el componente del formulario de contacto interactivo en la sección inferior de la página de portfolio. El formulario debe lucir "agentico" e inteligente, indicando con claridad al usuario que su mensaje será evaluado por un agente inteligente autónomo de IA y no simplemente enviado a una bandeja de entrada clásica.

## Archivos a crear o modificar
- `apps/web/src/modules/web-portfolio/components/contact-form.tsx`

## Criterios de finalización
- [ ] Implementar el componente `ContactForm` en `apps/web/src/modules/web-portfolio/components/contact-form.tsx`.
- [ ] **Campos del Formulario:**
  - `email`: Input tipo email para la respuesta.
  - `subject`: Select para el propósito del contacto (ej. "Propuesta de Empleo", "Proyecto Freelance", "Consulta Técnica", "Otro").
  - `message`: Textarea para el contenido del mensaje del remitente.
- [ ] **Diseño Visual:**
  - Estética minimalista y tecnológica.
  - Caja de información ("Alert" o "Banner") de marca destacando: *"Este formulario es analizado autónomamente por un Agente IA. Al enviarlo, el agente procesará tu mensaje, creará un reporte técnico interactivo en PDF y te responderá por email al instante."*
  - Botón de submit con un icono de "enviar" o "chispa" (`Sparkles`).
- [ ] **Mocking Inicial:**
  - Estructurar el formulario con React Hook Form u otros, pero dejando la acción de submit mockeada (imprimir por consola el payload) lista para la integración real en la Feature 15.
