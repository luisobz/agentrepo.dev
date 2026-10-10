# Dossier técnico: nanobot, NanoClaw y Gentle Shell

**Fecha de revisión documental:** 10 de octubre de 2026  
**Idioma:** español  
**Proyectos analizados:** [HKUDS/nanobot](https://github.com/HKUDS/nanobot), [nanocoai/nanoclaw](https://github.com/nanocoai/nanoclaw), [Gentleman-Programming/gentle-shell](https://github.com/Gentleman-Programming/gentle-shell).

> **Qué contiene este ZIP:** tres guías técnicas independientes y este índice comparativo. El objetivo es ayudarte a **entender, instalar, desplegar, asegurar, mantener y evaluar** cada proyecto, no duplicar íntegramente miles de líneas de documentación de upstream.
>
> **Alcance de la verificación:** pasos, capacidades y rutas cotejados con documentación pública oficial de los repositorios en la fecha indicada. **No se instalaron ni ejecutaron los tres agentes**, ni se verificaron sus consumos reales en una VPS. Los snippets que el texto denomina «ejemplo propuesto» son recomendaciones operativas; no un contrato oficial del proyecto. `main` puede cambiar y no coincidir con la release instalada: revisa `--help`, changelogs y documentación correspondiente a la versión antes de automatizar.

## Índice

1. [01-NANOBOT.md](01-NANOBOT.md) — asistente personal ligero, WebUI/Telegram, despliegue Ubuntu/Debian en VPS con `systemd` o Compose, herramientas, MCP, backups, mantenimiento y seguridad.
2. [02-NANOCLAW.md](02-NANOCLAW.md) — NanoClaw **v2**, modelo de aislamiento, onboarding, Docker, credential gateway, canales, separación entre agentes, operación, amenazas y migración.
3. [03-GENTLE-SHELL.md](03-GENTLE-SHELL.md) — agente de desarrollo basado en Pi, instalación standalone/integrada, homes, ODD, subagentes, perfiles, revisión, memoria, comandos y límites.

## En una frase

- **nanobot:** lo priorizaría para un bot personal **24/7 en VPS** con Telegram, cron y modelos a elección.
- **NanoClaw:** lo priorizaría cuando **la separación entre agentes, chats, archivos y credenciales** sea el factor decisivo; no confundas “código pequeño” con “RAM mínima”.
- **Gentle Shell:** lo priorizaría como **entorno agéntico de programación**, revisión y coordinación de subagentes, no como sustituto directo de un gateway de Telegram en producción.

## Comparativa útil

| Criterio | nanobot | NanoClaw v2 | Gentle Shell |
|---|---|---|---|
| Caso principal | Asistente personal, automatizaciones, canales | Asistente multicanal con aislamiento por contenedor | Desarrollo y revisión de software en terminal |
| Runtime | Python 3.11+, bucle de agente | Node host + Bun en contenedores Docker | Node/Pi + paquete `gentle-pi` |
| Instalación principal | Instalador, `uv`/pip o Docker | Clonar y `bash nanoclaw.sh` | `npm i -g gentle-pi` → `gentle-shell` |
| VPS | Muy natural: `systemd` o Docker Compose | Posible en Linux con Docker, onboarding más complejo | Posible por SSH para programar, pero no su orientación 24/7 |
| Aislamiento por defecto | Controles de aplicación; endurecer con bwrap/container | Contenedores por ámbito/sesión, mounts explícitos, gateway de credenciales | NO es un sandbox por sí mismo; controles de flujo y revisión |
| UI | Terminal nativo + WebUI + chat apps | Principalmente mensajería/CLI; configuración asistida | TUI/fullscreen de Pi, paneles de changes/agentes |
| Memoria | Workspace, memoria, sesiones; configuraciones de retención | Memoria y archivos por agent group, sesiones configurables | Memoria opcional con `gentle-engram` y continuidad ODD |
| MCP / extensiones | Sí, MCP y skills | Sí, extensiones por skills y cambios de código | Skills, paquetes Pi y complementos opcionales |
| Múltiples modelos | Presets/proveedores, compatible con modelos locales | Claude por defecto; OpenCode, Codex u Ollama con skills | Modelos de Pi + perfiles por rol |
| Coste operativo | API/modelos, VPS, opcionales | API/modelos, VPS y sobrecarga de Docker | API/modelos, equipo de desarrollo |
| Mejor para | Bot privado de Telegram que atiende y automatiza | Diferentes chats/usuarios/proyectos sin mezclar estado | Repositorios y tareas de programación complejas |

**Importante sobre “lightweight”:** no hay un benchmark uniforme de memoria, CPU, latencia o tokens entre estos tres. NanoClaw tiene una base de código reducida, pero puede iniciar múltiples contenedores; Gentle Shell tiene un launcher relativamente fino, pero la carga principal depende del modelo, plugins y subagentes. Evita comparar “líneas de código” con “RAM” o “coste de inferencia”.

## Árbol de decisión

1. **Quiero hablarle por Telegram desde cualquier lugar a un único asistente:** empieza por **nanobot** y modo pairing, con permisos de herramientas recortados.
2. **Mis grupos/personas no deben compartir secretos, sesiones, ficheros ni memoria:** empieza por **NanoClaw** y usa *separate agent groups*.
3. **Quiero que un agente explore código, implemente tareas, delegue y permita revisar cada cambio:** empieza por **Gentle Shell**.
4. **Quiero ambas cosas (asistente y coding):** mantener **dos procesos separados**. Que nanobot/NanoClaw genere propuestas e incidencias, y que Gentle Shell trabaje en un clone/branch dedicado; evita un puente con shell irrestricto entre ambos.

## Recomendación para una VPS pequeña

- **Piloto 1:** instala nanobot para Telegram en una VPS Linux, con usuario de servicio sin privilegios, carpeta de datos privada, `systemd --user` y sin abrir la WebUI a Internet. Accede a la interfaz mediante un **túnel SSH** cuando la necesites.
- **Piloto 2:** si quieres grupos separados, compara NanoClaw v2 con las mismas tareas. Reserva margen para Docker y procesos de agente. Coloca ficheros personales en volúmenes separados y monta únicamente los necesarios.
- **Gentle Shell:** ejecútalo en tu máquina de desarrollo o dentro de un entorno aislado para programar, no como agente de acceso general a la misma VPS de datos privados.

## Matriz de amenazas (resumen)

| Riesgo | nanobot | NanoClaw | Gentle Shell |
|---|---|---|---|
| Prompt injection por webs/chats | Existe; limitar fuentes y herramientas | Existe incluso en contenedor; limitar canal/credenciales | Existe al leer repositorios, documentación e issues |
| Lectura indebida de archivos | Restringir workspace + sandbox bwrap/seatbelt | Montajes mínimos, no montar `$HOME` | Ejecutar en repo/usuario separado; revisión de operaciones |
| Comandos destructivos | Desactivar/restringir `exec`, aprobaciones | Contenedor ayuda, pero los mounts escribibles importan | Guardas de acciones destructivas; YOLO no es sandbox |
| Fuga de credenciales | Variables/secret manager, no bot público | Gateway y *secret mode selective*; revisar políticas | No instalar con secretos amplios en el entorno |
| Exposición remota | Puertos WebUI en loopback + SSH/VPN | Canales con owner/roles y políticas estrictas | Mantener terminal/RPC accesible solo desde redes confiables |
| Supply chain | Fijar versiones, revisar plugins/MCP | Revisar instalador, skills, contenedores y gateway | Revisar paquetes npm y scripts postinstall |

## Checklist antes de dar acceso real

- [ ] Instalación probada con cuenta/carpeta **no privilegiada**.
- [ ] Versiones anotadas (`--version` o commit SHA) y posibilidad de rollback.
- [ ] API keys segregadas por proyecto; rotación y límites de gasto aplicados donde lo permita el proveedor.
- [ ] Bot de Telegram/Slack/Discord en modo privado, propietario validado, sin comodines públicos.
- [ ] No se ha montado `~/.ssh`, `~/.aws`, una carpeta entera del usuario ni `/var/run/docker.sock` en ningún agente.
- [ ] Se ha probado un prompt malicioso simulado en un documento externo para verificar que no ejecuta cambios peligrosos.
- [ ] Backup cifrado de configuraciones/sesiones, y **restauración probada**.
- [ ] Logs sin claves, tokens ni documentos sensibles; retención definida.
- [ ] Acceso a web/servicios internos limitado cuando sea posible (egress/SSRF).
- [ ] Los comandos de actualización, detención y desinstalación están documentados.

## Enlaces oficiales y criterio de actualización

- nanobot: [README](https://github.com/HKUDS/nanobot), [Quick Start](https://github.com/HKUDS/nanobot/blob/main/docs/quick-start.md), [Deployment](https://github.com/HKUDS/nanobot/blob/main/docs/deployment.md), [Configuration](https://github.com/HKUDS/nanobot/blob/main/docs/configuration.md), [Telegram](https://github.com/HKUDS/nanobot/blob/main/docs/guides/telegram-ai-agent.md).
- NanoClaw: [README v2](https://github.com/nanocoai/nanoclaw), [Isolation Model](https://github.com/nanocoai/nanoclaw/blob/main/docs/isolation-model.md), [Architecture](https://github.com/nanocoai/nanoclaw/blob/main/docs/architecture.md), [v1→v2](https://github.com/nanocoai/nanoclaw/blob/main/docs/v1-to-v2-changes.md).
- Gentle Shell: [README](https://github.com/Gentleman-Programming/gentle-shell), [Referencia técnica](https://github.com/Gentleman-Programming/gentle-shell/blob/main/docs/readme-reference.md), [Releases](https://github.com/Gentleman-Programming/gentle-shell/releases).

Para conservar una instalación reproducible, **guarda la versión/commit realmente desplegado**, no confíes en que los enlaces a `main` describirán indefinidamente tu entorno.
