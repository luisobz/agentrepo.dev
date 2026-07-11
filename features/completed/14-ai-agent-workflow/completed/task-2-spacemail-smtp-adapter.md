# Task 2: Adaptador SMTP de Spacemail (Nodemailer)

## Descripción
Implementar el puerto y el adaptador de envío de correos electrónicos. Dado que la plataforma Spaceship incluye un servicio SMTP de correo llamado Spacemail, utilizaremos `nodemailer` en el adaptador de infraestructura de NestJS para enviar correos al remitente y copias a la administración.

## Archivos a crear o modificar
- `packages/application/src/portfolio/ports/email-service.port.ts` (Puerto).
- `packages/infrastructure/src/email/spacemail/spacemail.service.ts` (Adaptador).
- `packages/infrastructure/src/index.ts` (Exportar el servicio).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `packages/infrastructure/src/email/spacemail/spacemail.service.spec.ts`
- Tipo: Integración / Mock.
- Qué debe probar:
  1. Que el adaptador crea correctamente el transportador de nodemailer.
  2. Que al llamar a `sendEmail(...)` se invoca `transporter.sendMail` con los parámetros correspondientes (para, asunto, cuerpo HTML, adjuntos).

## Criterios de finalización
- [ ] Puerto `EmailServicePort` define `sendEmail(to: string, subject: string, htmlContent: string, pdfAttachment?: Buffer): Promise<void>`.
- [ ] Adaptador `SpacemailService` implementa `EmailServicePort` y utiliza `nodemailer`.
- [ ] Conexión SMTP configurada a través de variables de entorno:
  - `SPACEMAIL_SMTP_HOST` (ej. `smtp.spacemail.com` o similar de Spaceship).
  - `SPACEMAIL_SMTP_PORT` (ej. `465` o `587`).
  - `SPACEMAIL_SMTP_USER`
  - `SPACEMAIL_SMTP_PASS`
- [ ] Permite adjuntar archivos en formato Buffer asignándole un nombre de archivo (ej. `Luisbz_Resume_Analysis.pdf`).

## Notas Técnicas
- Configura el remitente por defecto como `SPACEMAIL_SMTP_USER` para evitar rechazos de SPF/DKIM por parte del servidor SMTP de Spaceship.
