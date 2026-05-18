# Task 2: Módulo Spacemail (SMTP)

## Descripción
Adaptador para enviar emails. Spaceship incluye servicio de Spacemail, que se consume vía SMTP clásico usando `nodemailer`.

## Criterios de finalización
- [ ] Módulo/Servicio `EmailAdapter` implementado con `nodemailer`.
- [ ] Lee host, port, user y pass desde variables de entorno.
- [ ] Función `sendEmail(to, subject, body, attachments)` testeable (mock).
