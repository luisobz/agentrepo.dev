# Cloudflare para agentrepo.dev

Estado a 2026-09-26: zona creada con el plan Free, pendiente de activar. La
delegación pública sigue en `launch1.spaceship.net` y `launch2.spaceship.net`.
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

## Corte de DNS pendiente

`agentrepo.dev` tiene un registro DS de DNSSEC en el registrador. Su TTL
publicado en `.dev` era de 1800 segundos al preparar esta zona. Antes de
cambiar nameservers hay que desactivar DNSSEC en Spaceship, esperar a que
caduque el DS anterior en resolvers y comprobar que ya no aparece en el
registro padre. Tras activar Cloudflare, se puede volver a habilitar DNSSEC
con el nuevo DS de Cloudflare.

Spaceship advierte que al usar nameservers externos deja de gestionar
automáticamente los registros DNS de hosting y Spacemail. El 2026-09-26,
Spaceship Support confirmó por chat que para `agentrepo.dev`, ya conectado a
ambos productos, **no hace falta un TXT de verificación adicional** al cambiar
nameservers. Hay que conservar los registros necesarios, ya reproducidos en
Cloudflare. No se asignó un número de ticket al chat.

Después del cambio, comprobar DNSSEC, web, panel, health checks, correo,
certificados, cabeceras `noindex` y el workflow `Deploy (tag)` desde GitHub.
Mantener `noindex` hasta aprobar la publicación.
