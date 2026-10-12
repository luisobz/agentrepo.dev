# Linux Agent · 0.1.0

Administra un servidor por Telegram con sesiones de agente, mantenimiento de
paquetes, servicios y alarmas. Núcleo genérico para Debian/Ubuntu con systemd,
Python 3.11+ y sudo con soporte NOTAFTER. No incluye aplicaciones multimedia,
contenedores particulares, rutas de discos privadas ni credenciales.

## Cómo funciona

- **Bot de control** (`linux-agent-bot`): valida propietario y chat privado,
  conserva el token y exige confirmaciones de un solo uso que caducan en dos minutos.
- **Agente** (`linux-agent`): cuenta separada sin grupos privilegiados ni sudo
  general. Codex app-server gestiona sesiones persistentes y aprobaciones del runtime.
  El relay solo permite registrar temas, entregar respuestas y leer/acusar mensajes.
- **Root temporal**: `/root 15m` muestra una confirmación. El helper root valida
  entre un minuto y ocho horas, genera una regla con `NOTAFTER`, desactiva la caché
  de sudo y programa su retirada. `/root off` revoca nuevas elevaciones. Al arrancar
  el servidor la ventana se cierra. El modelo no tiene acceso al token del bot ni
  al componente que concede la ventana.
- **Mantenimiento**: APT y reinicios se ejecutan como jobs de systemd, con bloqueo
  para evitar operaciones simultáneas, log root y resultado consultable. Requieren
  confirmación humana y una ventana root activa al comenzar.
- **Alarmas**: RAM, carga normalizada por CPU, ocupación de disco/inodos, servicios
  configurados y heartbeat del puente. Umbrales sostenidos, histéresis, deduplicación,
  reintento de entrega y aviso de recuperación. No hay reparación automática.

## Instalación en un servidor nuevo

Primera versión candidata: ensayar en una VM desechable antes de producción.
El instalador rechaza usuarios/rutas ya existentes; no migra otros bots ni configura
el proveedor de IA automáticamente. No ejecutar sobre un servidor ya configurado.
Necesita `python3`, `sudo`, `systemd`, `apt` y `useradd` instalados. No necesita pip.

1. Descarga el paquete, verifica SHA256SUMS y revisa `install.sh`, `sudoers`, los
   helpers y las unidades. Conserva una sesión SSH administrativa independiente.
2. Instala revisando explícitamente el destino:

   ```sh
   sudo bash install.sh --fresh-server
   ```

3. Crea un bot nuevo con BotFather. Activa los temas privados si están disponibles
   para el bot y desactiva su incorporación a grupos. En el servidor, edita
   `/etc/linux-agent/telegram.env` como root: token nuevo y tu ID numérico. Conserva
   `root:linux-agent-bot 0640`. No pegues el token en comandos, repositorios o logs.
4. Edita `server.json`: lista de servicios `.service`, montajes que vigilar y
   umbrales. La lista de servicios también limita `/restart`. Empieza vacía.
5. Instala una versión revisada de Codex CLI en una ruta root-owned, ajusta
   `/etc/linux-agent/runtime.json` y autentícala **como linux-agent**, con su HOME
   `/var/lib/linux-agent`. No copies credenciales de otro servidor o usuario.
   El modelo es configurable; `null` utiliza el predeterminado del runtime.
6. Comprueba las unidades y activa el kit:

   ```sh
   sudo systemctl enable --now linux-agent-bot.service
   sudo systemctl enable --now linux-agent-bridge.service linux-agent-monitor.timer
   ```

7. En tu chat privado envía `/help`, `/status` y `/new Mi servidor`. El nuevo tema
   recibe los mensajes de esa sesión. Si Telegram no permite temas privados, no
   hay fallback silencioso al chat principal: habilítalos o revisa la integración.

El proveedor debe funcionar antes de iniciar el puente. No hay un modelo gratuito
incluido. Las credenciales de Codex quedan en su cuenta y las de Telegram en la del
bot. Solo se admiten textos: no se descargan ni ejecutan archivos recibidos.

## Uso

| Comando | Comportamiento |
| --- | --- |
| `/new nombre` | Crea una sesión/tema del agente |
| `/sessions` | Enumera las sesiones registradas |
| `/status` | Muestra monitorización, resultado del último job y root restante |
| `/updates` | Simula la actualización con el índice APT disponible |
| `/root 15m`, `/root 2h` | Solicita root temporal; requiere confirmación |
| `/root status`, `/root off` | Consulta/revoca nuevas elevaciones |
| `/refresh` | Refresca el índice APT; confirmación + root |
| `/upgrade` | `apt-get upgrade --with-new-pkgs`; confirmación + root |
| `/restart nombre.service` | Reinicia un servicio permitido; confirmación + root |
| `/reboot` | Programa reinicio en un minuto; confirmación + root |
| `/agentstop` | Solicita detener el turno en su tema; no mata el daemon |
| `/approve token`, `/deny token` | Responde a una aprobación del runtime en su sesión |

La aceptación del job no demuestra que haya terminado. Comprueba `/status`, el
servicio y el resultado real después de actualizar. El log completo se conserva en
`/var/lib/linux-agent-ops/last-operation.log`, accesible al administrador. No se
publican logs del sistema en Telegram automáticamente. No hay rollback de paquetes
prometido: prepara backup y plan de restauración antes de actualizar.

## Límites de protección

El código, las unidades, la política y el harness son root-owned. El agente no puede
modificarlos sin elevación. El archivo AGENTS.md describe la conducta esperada;
las cuentas, permisos y helpers constituyen la barrera técnica.

**Root completo puede modificar el harness, leer secretos o crear persistencia.**
`NOTAFTER` impide nuevas invocaciones de sudo tras caducar, incluso si falla el timer,
pero no mata procesos ya elevados ni revierte cambios. No se puede prometer aislamiento
frente a root dentro del mismo sistema. Para una barrera que sobreviva a root, usa
una VM separada y una autorización exterior. Los permisos del runtime son otra capa:
una ventana de sudo no desactiva automáticamente su sandbox ni sus aprobaciones.

Las nuevas sesiones usan `workspace-write` con aprobación `on-request`. No habilites
YOLO, acceso total o red sin revisar su impacto. Las tareas administrativas
predefinidas del bot funcionan por sus helpers, sin relajar ese sandbox.

Telegram y la conexión a Internet son dependencias externas: un servidor apagado,
sin red o con el bot roto no puede alertar sobre sí mismo. Para esa situación usa
un monitor exterior independiente. systemd reinicia procesos caídos; no se reinician
turnos sanos por un heartbeat atrasado. El monitor local avisa de puente desconectado.

## Verificación y retirada

```sh
PYTHONPATH=. python3 -m unittest discover -s tests
```

Antes de producción prueba: propietario incorrecto/grupo rechazados; confirmación
caducada/repetida/de otro tema; root cerrado/abierto/caducado/revocado/tras reboot;
permisos de código, token y sudo; bloqueo de mantenimiento; paquete simulado en VM;
alarma sostenida y recuperación; caída/reinicio del runtime; routing entre dos temas.
No uses una actualización o reinicio reales para comprobar un bot de producción.

Para retirar: cierra root desde tu acceso administrativo independiente, detén y
deshabilita `linux-agent-bot`, `linux-agent-bridge` y `linux-agent-monitor.timer`, y
retira reglas/unidades después de verificar que no quedan jobs o procesos elevados.
Revoca el token en BotFather y las credenciales del proveedor. Conserva auditoría
privada; no borres backups automáticamente.

## Referencias y licencia

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Codex app-server](https://developers.openai.com/codex/app-server)
- [Seguridad de Codex](https://developers.openai.com/codex/security)
- [sudoers / NOTAFTER](https://www.sudo.ws/docs/man/sudoers.man/)
- [systemd.exec](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html)

AGPL-3.0-only, igual que el repositorio que distribuye este kit. No incluye software
ni credenciales del proveedor. Estado: candidato 0.1.0; pruebas automatizadas y
ensayo aislado documentados en VALIDATION.md. No se ha instalado en el servidor de
origen ni en un servidor de producción como parte de esta publicación.
