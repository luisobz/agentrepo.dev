# Cloudflare para agentrepo.dev

Estado a 2026-09-27: zona creada con el plan Free, pendiente de activar en el
panel de Cloudflare. Spaceship confirmó el cambio de delegación y el registro
`.dev` ya publica `everton.ns.cloudflare.com` y `lucy.ns.cloudflare.com`.
Algunos resolutores todavía conservan en caché los nameservers anteriores.
Cloudflare asignó `everton.ns.cloudflare.com` y `lucy.ns.cloudflare.com` y se
configuró SSL/TLS en **Full (strict)**. El hosting y los despliegues siguen en
Spaceship y GitHub Actions.

## Registros preparados

Se compararon las respuestas DNS de Spaceship y Cloudflare para los registros
actuales. Coinciden los 14 registros lógicos:

- `A`: `@`, `admin`, `ftp`, `ftp.admin`, `webdisk`, `webdisk.admin` → `66.29.148.38`.
- `CNAME`: `www` → `agentrepo.dev`; `www.admin` → `admin.agentrepo.dev`.
- `MX`: `@` → `mx1.spacemail.com` y `mx2.spacemail.com`, prioridad 0.
- `SRV`: `_autodiscover._tcp` → `autoconfig.spacemail.com`, puerto 443.
- `TXT`: SPF combinado en `@`, SPF en `admin`, DKIM en `spacemail._domainkey`.

Cloudflare marca `@`, `admin`, `www` y `www.admin` como **Proxied**. FTP,
webdisk y los registros de correo quedan **DNS only**. No se debe añadir una
regla de caché global para HTML ni para las rutas de API/admin: Cloudflare no
cachea HTML ni JSON por defecto.

## Corte de DNS

DNSSEC se desactivó en Spaceship y se comprobó que el DS anterior desapareció
del registro `.dev` antes del cambio de nameservers. Spaceship confirmó los
nameservers de Cloudflare y el registro `.dev` ya los publica. Cloudflare sigue
comprobando la delegación; después de activar la zona queda reactivar DNSSEC
con el nuevo DS de Cloudflare en Spaceship.

Spaceship advierte que al usar nameservers externos deja de gestionar
automáticamente los registros DNS de hosting y Spacemail. El 2026-09-26,
Spaceship Support confirmó por chat que para `agentrepo.dev`, ya conectado a
ambos productos, **no hace falta un TXT de verificación adicional** al cambiar
nameservers. Hay que conservar los registros necesarios, ya reproducidos en
Cloudflare. No se asignó un número de ticket al chat.

La web, el panel y ambos health checks responden 200 a través de la IP del
proxy de Cloudflare, con certificado TLS válido. Queda comprobar la activación
de la zona, DNSSEC, correo, cabeceras `noindex` y el workflow `Deploy (tag)`
desde GitHub tras la propagación.
Mantener `noindex` hasta aprobar la publicación.
