# nanobot — guía técnica de instalación, VPS y operación

**Revisado:** 10/10/2026  
**Repo:** https://github.com/HKUDS/nanobot  
**Documentación primaria:** [instalación](https://github.com/HKUDS/nanobot/blob/main/docs/quick-start.md), [despliegue](https://github.com/HKUDS/nanobot/blob/main/docs/deployment.md), [configuración](https://github.com/HKUDS/nanobot/blob/main/docs/configuration.md), [Telegram](https://github.com/HKUDS/nanobot/blob/main/docs/guides/telegram-ai-agent.md).

> Las opciones y ejemplos corresponden a la documentación oficial accesible en esta fecha. El README identifica v0.3.5 como la release publicada en su momento, pero **verifica `nanobot --version`**; los documentos del branch `main` pueden describir funciones más recientes que tu wheel de PyPI. Comandos marcados como *propuesta operativa* son diseño de despliegue, no acciones automáticas verificadas aquí.

## 1. Resumen ejecutivo

nanobot es un asistente agéntico personal y autoalojable basado en Python. Recibe mensajes desde una interfaz web, terminal o canales de chat, decide si emplear herramientas, gestiona sesiones/archivos/memoria y puede ejecutar automatizaciones. Su atractivo frente a sistemas más grandes es el **bucle central de agente relativamente pequeño**, con funcionalidades añadidas mediante herramientas, canales y plugins.

**Lo elegiría para:** un asistente privado de Telegram en una VPS que se conecte a un modelo remoto y ejecute tareas programadas, consultas y acciones acotadas. **No lo elegiría sin más** para ejecutar código hostil o separar fuertemente datos de varios usuarios: sus restricciones a nivel aplicación deben reforzarse con aislamiento del SO o contenedores.

**Capacidades documentadas:** WebUI, terminal/TUI, conversaciones y workspaces, presets y fallbacks de modelos, canales de mensajería, memoria, skills, cron/automations, MCP, web search/fetch, herramientas de archivo/shell, varias instancias, despliegue Docker/Compose, integración mediante Python SDK y API compatible con OpenAI. La disponibilidad exacta depende del canal, extra instalado, release y configuración.

## 2. Arquitectura conceptual

```text
Telegram / WebUI / CLI / otros canales
               |
        gateway de nanobot
               |
       sesión + workspace
               |
      contexto / memoria / skills
               |
       LLM (API o local)
               |
    herramientas / MCP / web / shell
               |
       respuesta al canal
```

- **`~/.nanobot/config.json`**: configuración de modelos, herramientas, permisos, canales, WebUI y runtime.
- **`~/.nanobot/workspace/`**: memoria, skills, automations y artefactos de trabajo.
- **`~/.nanobot/sessions/<workspace-id>/`**: historial de sesiones separado del workspace.
- **Gateway**: mantiene canales, trabajos recurrentes, sesiones y conectividad.
- **WebUI**: se inicia normalmente con `nanobot webui`, por defecto en `http://127.0.0.1:8765` para uso local.
- **Health** del gateway: valor por defecto local `127.0.0.1:18790`; API `nanobot serve` normalmente `8900`. No se deben publicar por rutina.

**Seguridad del diseño:** una restricción por workspace aplicada por software **no sustituye** a un aislamiento de kernel. En Linux puedes activar `tools.exec.sandbox: "bwrap"`, y en macOS `"seatbelt"`; la documentación indica que ninguno de esos dos backends aísla la red.

## 3. Requisitos y dimensionamiento

### Requisitos confirmados

- Python **3.11 o superior** para la ruta Python.
- Un proveedor y modelo válidos (API remota, endpoint corporativo o servidor local compatible).
- Conexión saliente HTTPS desde la VPS hacia proveedor y hacia Telegram si lo usas.
- Almacenamiento persistente para `~/.nanobot` y backups.
- Opcional: Docker Engine + Compose para despliegue contenedorizado; `bubblewrap` para sandbox Linux fuera del contenedor.

### Dimensionamiento orientativo, NO benchmark

- Para una prueba personal con LLM remoto: empieza con **2 vCPU, 2–4 GB de RAM y 20 GB SSD** si puedes asumir ese coste; mide antes de reducir. Esto es un **margen conservador recomendado, no un mínimo oficial**.
- Si agregas servicios locales de modelos, navegador, OCR, scraping o muchos plugins, necesitarás bastante más. La memoria de un modelo local depende del tamaño/cuantización y no se deduce del tamaño de nanobot.
- Monitoriza `free -h`, `df -h`, `top`/`htop`, tiempos de respuesta, reinicios, uso de tokens y gasto por proveedor. Establece límites de consumo a nivel de API.

## 4. Instalación local sencilla (Linux/macOS)

La documentación recomienda un instalador que elige virtualenv, `uv`, `pipx` o un entorno propio:

```bash
# Revisar antes de ejecutar: script remoto del repositorio oficial
curl -fsSL https://raw.githubusercontent.com/HKUDS/nanobot/main/scripts/install.sh -o /tmp/nanobot-install.sh
less /tmp/nanobot-install.sh
sh /tmp/nanobot-install.sh

# Alternativa reproducible por gestor:
uv tool install nanobot-ai
# o pipx install nanobot-ai

nanobot --version
nanobot onboard --wizard
nanobot status
nanobot agent -m "Hello!"
```

Si el ejecutable no está en PATH, el instalador indica cómo invocarlo; opciones documentadas:

```bash
uv tool run --from nanobot-ai nanobot --version
pipx run --spec nanobot-ai nanobot --version
~/.nanobot/venv/bin/python -m nanobot --version
```

**No uses `sudo pip install` en el Python del sistema**. Si el sistema marca `externally-managed-environment`, usa `uv tool`, `pipx` o venv.

### Método Python con virtualenv (útil en VPS)

```bash
python3 --version        # 3.11+
python3 -m venv ~/venvs/nanobot
source ~/venvs/nanobot/bin/activate
python -m pip install --upgrade pip
python -m pip install nanobot-ai
nanobot --version
nanobot onboard --wizard
nanobot status
nanobot agent -m "Hello!"
```

La prueba `agent -m` realiza una llamada real al modelo si está configurado; `status` valida el estado local y no necesariamente llama a la API.

## 5. Despliegue VPS: ruta A — systemd (recomendada para un único bot personal)

**Escenario:** Ubuntu/Debian, acceso SSH, usuario no root y proveedor LLM remoto. Los comandos de provisión Linux siguientes son **propuesta operativa**, no instalador oficial de nanobot.

### 5.1 Endurecer la máquina base

```bash
# Accede con tu usuario administrativo por SSH.
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip git curl ca-certificates

# Firewall: NO ejecutes sin antes confirmar que SSH funciona
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status verbose
```

Si la distribución trae Python inferior a 3.11, usa un intérprete oficial compatible, por ejemplo Python 3.11/3.12 proporcionado por tu distribución o un gestor de versiones confiable. **No presupongas** que el alias `python3` de todas las versiones de Debian/Ubuntu cumple.

Crea una cuenta separada (ejemplo `nanobot`, sin login root):

```bash
sudo adduser nanobot
sudo loginctl enable-linger nanobot
sudo -iu nanobot
```

La cuenta no debería pertenecer a grupos `sudo` ni `docker`. Si administras el servicio con tu usuario habitual, el aislamiento de cuentas será menor. No guardes credenciales ajenas en su home.

### 5.2 Instalar en virtualenv del usuario

```bash
python3 --version
python3 -m venv ~/.venvs/nanobot
~/.venvs/nanobot/bin/python -m pip install --upgrade pip
~/.venvs/nanobot/bin/python -m pip install nanobot-ai
~/.venvs/nanobot/bin/nanobot --version
~/.venvs/nanobot/bin/nanobot onboard --wizard
```

Inicializa `~/.nanobot/config.json`, selecciona proveedor/modelo y realiza una primera prueba. Si no hay navegador en la VPS, usa el asistente terminal `onboard --wizard` o edita JSON manualmente (apartado 7).

### 5.3 Arrancar el servicio con el instalador oficial

```bash
~/.venvs/nanobot/bin/nanobot gateway install-service --manager systemd --dry-run
~/.venvs/nanobot/bin/nanobot gateway install-service --manager systemd
systemctl --user status nanobot-gateway
journalctl --user -u nanobot-gateway -f
```

**Qué hace:** crea `~/.config/systemd/user/nanobot-gateway.service`, recarga el usuario systemd, habilita y reinicia el servicio. Usa el Python de la instalación desde la que llamaste al CLI. `loginctl enable-linger nanobot` permite que la unidad de usuario continúe tras cerrar SSH (necesita permisos administrativos).

Control diario:

```bash
systemctl --user restart nanobot-gateway
systemctl --user stop nanobot-gateway
systemctl --user start nanobot-gateway
journalctl --user -u nanobot-gateway --since "1 hour ago" --no-pager
```

**No actives también** `nanobot gateway --background` si el servicio systemd ya lo está ejecutando sobre la misma instancia: podrías tener dos procesos y puertos/sesiones en conflicto.

### 5.4 Cómo entrar a la WebUI desde tu portátil sin exponerla

En la VPS, el gateway/WebUI debe escuchar únicamente en loopback. Para acceder desde tu PC:

```bash
# EJECUTA EN TU ORDENADOR, NO EN LA VPS:
ssh -N -L 8765:127.0.0.1:8765 usuario@IP_O_HOST_DE_TU_VPS
```

Abre `http://127.0.0.1:8765` **en tu ordenador**. Verifica en la VPS qué direcciones están escuchando:

```bash
ss -lntp | grep -E '8765|18790|8900'
```

Si ves `0.0.0.0:8765` o `[::]:8765` en una instancia expuesta, revisa la configuración y firewall antes de seguir. No bastan un enlace difícil de adivinar ni un token trivial. Alternativas seguras: VPN privada o un proxy autenticado correctamente, no simple forwarding público.

### 5.5 Variables secretas en systemd (propuesta operativa)

nanobot admite `"${ENV_VAR}"` en campos JSON. Puedes cargar claves mediante una unidad systemd de usuario:

```bash
mkdir -p ~/.config/nanobot
chmod 700 ~/.config/nanobot
install -m 600 /dev/null ~/.config/nanobot/secrets.env
nano ~/.config/nanobot/secrets.env
```

Contenido de ejemplo (`NO` lo subas a Git):

```ini
PROVIDER_API_KEY=REEMPLAZAR
TELEGRAM_TOKEN=REEMPLAZAR
```

Edita la unidad generada:

```bash
systemctl --user edit nanobot-gateway
```

Añade:

```ini
[Service]
EnvironmentFile=%h/.config/nanobot/secrets.env
```

Después:

```bash
systemctl --user daemon-reload
systemctl --user restart nanobot-gateway
systemctl --user status nanobot-gateway
```

En el JSON, emplea `"${PROVIDER_API_KEY}"` y `"${TELEGRAM_TOKEN}"`. Recuerda: las variables del **servicio** no están automáticamente disponibles en el **terminal SSH**; para pruebas de CLI en el mismo entorno, inyéctalas por un método seguro (gestor de secretos o carga temporal de un archivo shell válido). No imprimas ni exportes tus tokens en logs compartidos.

## 6. Despliegue VPS: ruta B — Docker Compose

La documentación oficial ofrece `Dockerfile`, `docker-compose.yml` y un override para bwrap. **Esta ruta requiere clonar el repo** porque Compose construye desde ese checkout. Recomendación: fija una etiqueta/commit revisado si buscas reproducibilidad, y evalúa las actualizaciones antes de usar `main`.

```bash
# En VPS, con Docker Engine + Compose plugin ya instalados:
git clone https://github.com/HKUDS/nanobot.git
cd nanobot

git rev-parse --short HEAD    # registra este hash
# Instala dependencias de Telegram dentro de la imagen:
NANOBOT_CHANNELS=telegram docker compose build

docker compose run --rm nanobot-cli onboard
# Edita ~/.nanobot/config.json del usuario que ejecuta compose:
chmod 700 ~/.nanobot
chmod 600 ~/.nanobot/config.json
nano ~/.nanobot/config.json

docker compose run --rm nanobot-cli agent -m "Hello!"
docker compose up -d nanobot-gateway
docker compose ps
docker compose logs -f nanobot-gateway
```

**Persistencia:** el Compose oficial monta `~/.nanobot` del host en `/home/nanobot/.nanobot`. El contenedor ejecuta el proceso final con usuario sin privilegios, UID 1000, y usa ciertas capacidades para ajustar el propietario del bind mount al iniciar. Revisa permisos de archivos antes de restaurar backups.

**Exposición de puertos:** revisa **`docker compose config`** y los `ports:` efectivos. Si una publicación sale en `0.0.0.0`, cámbiala para restringirla a `127.0.0.1` o elimínala si vas a usar solo Telegram long polling. No asumas que Docker respetará todas las reglas UFW como los procesos normales: revisa reglas Docker, cortafuegos del proveedor y pruebas externas.

**Si necesitas sandbox de comandos Linux dentro del contenedor:**

```bash
# Sólo después de establecer tools.exec.sandbox=bwrap en config.json:
docker compose -f docker-compose.yml -f docker-compose.bwrap.yml up -d nanobot-gateway
```

El override oficial agrega permisos para namespaces y desactiva perfiles AppArmor/seccomp en esa variante. **Es un tradeoff de seguridad:** evalúa host y amenaza; no lo actives automáticamente porque “sandbox” suene mejor. El host debe permitir namespaces de usuario sin privilegios.

Comandos operativos:

```bash
docker compose logs --tail=100 nanobot-gateway
docker compose restart nanobot-gateway
docker compose down  # detiene, no debería borrar bind mount
```

Evita montar el socket Docker dentro del agente; sería una vía para comprometer el host. No ejecutes el contenedor con `--privileged` por comodidad.

## 7. Configuración del proveedor/modelo (ejemplo genérico)

El método más fácil es **WebUI → Settings → Models**. Para un servidor sin navegador, `nanobot onboard --wizard` permite onboarding. Configuración manual: fusiona el siguiente fragmento en el JSON generado —**no reemplaces sin más el resto del archivo**:

```json
{
  "providers": {
    "custom": {
      "apiKey": "${PROVIDER_API_KEY}",
      "apiBase": "https://api.tu-proveedor-ejemplo.com/v1"
    }
  },
  "modelPresets": {
    "primary": {
      "provider": "custom",
      "model": "ID-REAL-DEL-MODELO"
    }
  },
  "agents": {
    "defaults": {
      "modelPreset": "primary"
    }
  }
}
```

Sustituye juntos el proveedor, el endpoint, el modelo y la clave correctos; los IDs de modelo **no son intercambiables**. La misma estructura admite proveedores nativos, presets, fallbacks y servidores OpenAI-compatible; consulta la documentación de configuración actual.

Validación:

```bash
nanobot status
nanobot agent -m "Resume en una frase qué puedes hacer."
```

Si no tienes el binario en PATH, usa su ruta absoluta, según instalación.

## 8. Telegram: alta, pairing y uso privado

**Telegram funciona por long polling por defecto**, así que para el piloto normalmente **no necesitas un webhook público ni abrir puertos entrantes**.

1. En Telegram abre `@BotFather`, crea bot con `/newbot`, copia el token a tu gestor seguro.
2. En el mismo Python/venv de nanobot activa el extra/plugin:

   ```bash
   nanobot plugins enable telegram
   ```
3. Usa WebUI → Settings → Channels → Telegram, o añade manualmente a `~/.nanobot/config.json`:

   ```json
   {
     "channels": {
       "telegram": {
         "enabled": true,
         "token": "${TELEGRAM_TOKEN}"
       }
     }
   }
   ```

4. **No configures `allowFrom: ["*"]`**. Al omitir `allowFrom`, el canal entra en modo de pairing según la guía oficial.
5. Reinicia el gateway y comprueba `nanobot channels status`.
6. Escribe un DM al bot desde tu cuenta; al recibir un código de pairing, apruébalo **desde una superficie ya confiable**:

   ```bash
   nanobot agent -m "/pairing approve ABCD-EFGH"
   ```

7. Repite el mensaje: debe responder normalmente. Nunca aceptes por chat una orden de aprobación de un usuario aún no autorizado.

**Para grupos:** revisa quién puede mencionar el bot, cómo maneja adjuntos/enlaces y si tiene permiso de ejecución. Un chat público con shell habilitada es una mala combinación. Si el token se filtró, revócalo en BotFather y actualiza el servicio.

## 9. Herramientas, MCP y automatizaciones

### Herramientas integradas

- **File/workspace:** lectura/escritura limitable al área de trabajo. Evita dar acceso al home del usuario de sistema.
- **Shell (`tools.exec`)**: potente, pero de alto riesgo. Puedes desactivarla por completo con `"tools": {"exec": {"enable": false}}` **fusionado** en tu configuración. También admite timeout y sandbox.
- **Web:** búsqueda/fetch y controles SSRF; las páginas externas pueden contener instrucciones maliciosas dirigidas al agente.
- **MCP:** configuración bajo `tools.mcpServers.<nombre>` para servidores stdio o HTTP/SSE, según documentación. Un MCP de terceros equivale a instalar software con permisos: revisa su autor y alcance.
- **Skills:** capacidad de ampliar comportamiento; revisa cualquier script ejecutable que incorporen.

### Fragmento de endurecimiento inicial (Linux)

El siguiente es un **fragmento** para integrar, no un JSON completo:

```json
{
  "tools": {
    "restrictToWorkspace": true,
    "exec": {
      "sandbox": "bwrap",
      "timeout": 60
    }
  }
}
```

Para instalar bubblewrap (host, sin Docker):

```bash
sudo apt install bubblewrap
```

**Advertencia:** con Docker, activar `bwrap` exige considerar el override descrito arriba. Si aún no has revisado esos permisos, es preferible **deshabilitar `exec`** en el primer despliegue. El sandbox no bloquea tráfico de red ni garantiza inmunidad frente a vulnerabilidades.

### MCP ilustrativo

La documentación oficial muestra el concepto:

```json
{
  "tools": {
    "mcpServers": {
      "mi-servidor": {
        "command": "npx",
        "args": ["-y", "PAQUETE_MCP_REVISADO"],
        "env": { "API_KEY": "${API_KEY_DEL_MCP}" }
      }
    }
  }
}
```

No copies sin revisar paquetes `npx -y` desde Internet en una VPS crítica: fija versión, controla dependencias y permisos de API. Para HTTP/SSE usa endpoint HTTPS, credenciales propias y política de egress.

### Automations y heartbeat

Desde la WebUI se pueden crear tareas programadas y ver resultados; la documentación dedica una sección a cron, heartbeat y acciones de agente. Para la primera puesta en producción:

1. Programa una tarea **inocua** (resumen de un archivo de prueba, una vez al día).
2. Comprueba que se ejecuta tras cerrar SSH/reiniciar el servicio.
3. Comprueba la zona horaria efectiva del servicio y de la tarea.
4. Define timeout, límite de peticiones y presupuesto API.
5. No programes escrituras destructivas sin revisión explícita.

Documentación: https://github.com/HKUDS/nanobot/blob/main/docs/automations.md

## 10. Seguridad avanzada y modelo de permisos

### Capas recomendadas

1. **Acceso al bot:** pairing, allowlist por cuenta, no público.
2. **Acceso a ficheros:** `restrictToWorkspace: true`, datos fuera de workspace, workspace dedicado.
3. **Ejecución:** `exec.enable: false` salvo que exista necesidad; si la hay, sandbox `bwrap`/contenedor, timeout y comandos acotados.
4. **Acceso remoto:** loopback para interfaces HTTP/WebSocket, túnel SSH, VPN o proxy realmente autenticado.
5. **Credenciales:** `${ENV_VAR}` desde fichero con modo 600/gestor de secretos; no copiar tokens en chats.
6. **Red:** bloquear conexiones innecesarias a metadatos de nube y direcciones privadas, revisar `tools.ssrfWhitelist` (mantener vacía salvo excepción justificada).
7. **Dependencias:** no instalar skills/MCP desconocidos sin auditoría.
8. **Auditoría:** logs, cambios en archivos y backups; no guardar datos sensibles de forma indefinida.

### Qué no resuelve nanobot automáticamente

- No garantiza aislamiento fuerte entre personas si se reutiliza un mismo workspace y credenciales.
- No previene todas las prompt injections provenientes de mensajes y documentos.
- No detiene exfiltración si un agente puede leer secretos y tiene salida de red.
- No hace “seguro” un host por usar `restrictToWorkspace`; es guardia software, no frontera del kernel.
- `bwrap`/`seatbelt` no limitan la red según la referencia oficial.

## 11. Operación, backup y recuperación

### Observabilidad

```bash
nanobot --version
nanobot status
nanobot channels status
nanobot gateway status
nanobot gateway logs

# si usas systemd:
systemctl --user status nanobot-gateway
journalctl --user -u nanobot-gateway -n 100 --no-pager

# si usas Compose:
docker compose ps
docker compose logs --tail=100 nanobot-gateway
```

`nanobot gateway status/logs` corresponden al modo en background del propio CLI; con systemd o Compose conviene usar el supervisor real.

### Backup seguro (propuesta operativa)

Con el servicio parado, guarda `~/.nanobot` (incluye config, sesiones, workspace y, potencialmente, secretos). Ejemplo conceptual:

```bash
systemctl --user stop nanobot-gateway
umask 077
tar -czf "$HOME/nanobot-backup-$(date +%F).tar.gz" -C "$HOME" .nanobot
systemctl --user start nanobot-gateway
```

**El TAR no está cifrado:** cifra el fichero con una herramienta de confianza antes de sacarlo de la VPS, restringe permisos, aplica retención, y prueba una restauración en otro usuario/host de pruebas. Un backup de la carpeta de nanobot **no incluye** automáticamente el fichero `~/.config/nanobot/secrets.env` de nuestro ejemplo; consérvalo por separado en gestor seguro.

### Actualización controlada

```bash
# Si se instaló con uv:
uv tool upgrade nanobot-ai
# Si se instaló con pipx:
pipx upgrade nanobot-ai
# Si usa virtualenv:
~/.venvs/nanobot/bin/python -m pip install -U nanobot-ai
```

Después compara `nanobot --version`, relee release notes, reinicia servicio, prueba Telegram, pruebas de pairing, sandbox y automations. Para git/Compose, fija commit, haz backup y reconstruye con `docker compose build` y `up -d` tras revisar cambios. No hagas actualizaciones de `main` desatendidas en producción.

### Troubleshooting (orden de diagnóstico)

| Síntoma | Qué comprobar primero |
|---|---|
| `nanobot: command not found` | PATH, venv, runner `uv`/`pipx`, instalación como usuario correcto |
| `status` OK pero no responde | credencial del proveedor, ID de modelo, endpoint, red saliente, cuotas |
| Telegram sin mensajes | `channels status`, token, plugin en el mismo venv, gateway vivo, conectividad |
| Recibo código pero no acceso | aprobar pairing desde CLI/superficie autorizada |
| WebUI inaccesible por SSH | servicio escuchando, `ssh -L`, puerto local ocupado, bind loopback |
| Herramientas no leen archivos | workspace seleccionado, permisos Unix, restrictToWorkspace, rutas sandbox |
| bwrap falla con `Operation not permitted` | namespaces de usuario, política del host, seccomp/Compose override |
| automations no se ejecutan | servicio persistente, zona horaria, logs, cron, permisos de tarea |
| sube consumo/tokens | sesiones acumuladas, concurrencia, bucles de herramienta, modelo elegido |

## 12. Runbook de piloto de 24 horas

- [ ] Bot crea configuración propia de prueba y responde en CLI.
- [ ] Modo Telegram pairing; apruebo **solo mi usuario**.
- [ ] El gateway continúa activo tras desconectar SSH.
- [ ] La WebUI no tiene un puerto público.
- [ ] `exec` deshabilitada hasta terminar la auditoría, o sandbox aplicado y probado.
- [ ] Los secretos no están en shell history ni Git.
- [ ] Tarea programada inocua funciona una vez.
- [ ] Se mide RAM/CPU/latencia y consumo API durante un día.
- [ ] Se realiza copia/restauración de datos de prueba.
- [ ] Se documentan usuario Linux, IP, ruta de venv, config, unidad systemd y commit/versión.

## 13. Referencias oficiales

1. [README del proyecto](https://github.com/HKUDS/nanobot)
2. [Instalación y Quick Start](https://github.com/HKUDS/nanobot/blob/main/docs/quick-start.md)
3. [Deployment — Compose, Docker, systemd, LaunchAgent](https://github.com/HKUDS/nanobot/blob/main/docs/deployment.md)
4. [Configuration — modelos, secretos, tools, sandbox, MCP](https://github.com/HKUDS/nanobot/blob/main/docs/configuration.md)
5. [Conectar Telegram y pairing](https://github.com/HKUDS/nanobot/blob/main/docs/guides/telegram-ai-agent.md)
6. [Automations](https://github.com/HKUDS/nanobot/blob/main/docs/automations.md)
7. [Guía segura de agente local](https://github.com/HKUDS/nanobot/blob/main/docs/guides/secure-local-ai-agent.md)

**Conclusión:** nanobot es probablemente el comienzo más directo de los tres para una VPS personal: no requiere introducir Docker en el primer paso y ofrece un servicio persistente documentado. Primero comprueba Telegram privado y la fiabilidad; **después** añade MCP, shell y automatizaciones.
