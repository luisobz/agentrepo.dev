# NanoClaw v2 — guía completa con énfasis en aislamiento

**Revisado:** 10/10/2026  
**Proyecto:** https://github.com/nanocoai/nanoclaw  
**Documento crucial:** https://github.com/nanocoai/nanoclaw/blob/main/docs/isolation-model.md

> **AVISO DE VERSIÓN:** esta guía trata **NanoClaw v2**, tal como aparece en el README oficial consultado el 10/10/2026. Muchas guías de Internet todavía explican el sistema **v1** con `claude` → `/setup`, una única base SQLite y otra estructura. La ruta de onboarding publicada actualmente en el README principal es `git clone ... nanoclaw-v2` → `bash nanoclaw.sh`. **No mezcles las instrucciones v1/v2**. Documentos de `main` pueden cambiar; comprueba el commit desplegado.

## 1. Qué es, qué no es y para quién vale

NanoClaw es un asistente autoalojable diseñado alrededor de una idea concreta: **cada sesión/ámbito de agente se ejecuta dentro de un contenedor de Linux con acceso explícito a recursos**, en lugar de considerar un prompt o una allowlist el único mecanismo de seguridad. La versión v2 tiene un host Node que recibe mensajes y orquesta contenedores Docker; el runner usa Bun y, por defecto, el SDK de agentes de Anthropic. Los canales y proveedores opcionales se agregan mediante skills al código del fork.

**Lo usaría para:** un asistente que participa en varios chats o proyectos y donde importa la separación de conversaciones, memoria y permisos; o un prototipo en el que quieres estudiar una arquitectura de aislamiento real y ampliarla.

**No lo confundiría con:** un microservicio que consume menos de 50 MB; un contenedor Docker puede demandar bastante más memoria que un loop Python. Tampoco significa que «cualquier comando dentro del contenedor sea seguro»: el aislamiento depende de configuración, mounts, networking, privilegios, vulnerabilidades del runtime y gateway.

### Características documentadas en v2

- Mensajería multicanal: Telegram, Slack, Discord, WhatsApp, iMessage y otros mediante instalación por skills (no todos incluidos en `main`).
- Un agente puede usar varios canales y viceversa, con sesiones compartidas o separadas.
- Agent groups con identidad, memoria, instrucciones y sistema de archivos propios.
- Docker en macOS/Linux/WSL2; un host orquesta contenedores separados.
- Tareas programadas, navegación web, herramientas, plantillas de agentes.
- Gateway de credenciales: las claves no entran como valores crudos al contenedor; se inyectan en solicitudes de salida permitidas.
- Modelo principal Claude Agent SDK, con alternativas instalables vía skills: Codex, OpenCode y Ollama, según documentación actual.
- Personalización “código + skills” frente a grandes paneles de configuración.

## 2. Arquitectura de NanoClaw v2

```text
Telegram / Discord / Slack / WhatsApp / etc.
                     |
              ADAPTADORES host
                     |
             Node host / router
                     |
             DB central (v2.db)
                     |
       DB por sesión: inbound.db  <-- host escribe, contenedor lee
                     |
          Contenedor del agente
        Bun + SDK + herramientas
                     |
       DB por sesión: outbound.db <-- contenedor escribe, host lee
                     |
           host entrega respuesta

             Salidas a APIs
                     |
       Credential gateway / Vault
                     |
         Servicios autenticados
```

Según las notas de migración y arquitectura oficiales:

- `data/v2.db` almacena usuarios, roles, grupos de agente, grupos de mensajes y relaciones.
- `data/v2-sessions/<session_id>/inbound.db` recibe mensajes/eventos/tareas; escritor principal: host.
- `data/v2-sessions/<session_id>/outbound.db` acumula respuestas/estado; escritor principal: contenedor.
- `groups/<folder>/` contiene identidad/instrucciones/memoria y configuración del agent group.
- `groups/<folder>/container.json` es configuración opcional de contenedor y montajes. **No copies recetas v1 sin revisar el formato actual.**
- El host hace barridos periódicos y despierta contenedores cuando hay mensajes o tareas.
- Las extensiones de canal y de proveedor se registran cuando se instalan sus skills; `main` contiene principalmente infraestructura.

Esta arquitectura es interesante por su separación entre **control de entrada/salida del host** y **ejecución dentro del contenedor**. El host sigue siendo una pieza de confianza crítica.

## 3. Tres niveles de aislamiento (muy importante)

NanoClaw distingue **canal de comunicación**, **agent group** y **sesión**. No todas las configuraciones de varios chats representan privacidad entre usuarios.

### Nivel 1 — Sesión compartida (`agent-shared`)

Dos o más canales escriben en **la misma conversación**. Comparten workspace, memoria, instrucciones e historial; incluso mensajes de plataformas distintas aparecen en el mismo contexto.

**Adecuado:** alertas de GitHub y un Slack de un mismo proyecto que deliberadamente quieren conversación conjunta.  
**Inadecuado:** vida personal vs trabajo, usuarios externos con acceso no equivalente.

### Nivel 2 — Mismo agente, sesiones independientes (`shared` / `per-thread`)

Los chats conservan hilos separados, pero **comparten memoria duradera, herramientas, archivos e identidad del agent group**. Una conversación no aparece textual en la otra, pero puede existir filtración indirecta por memoria persistente.

**Adecuado:** tú mismo usando el mismo asistente desde Telegram y Discord.  
**Inadecuado:** diferentes personas con información mutuamente confidencial.

### Nivel 3 — Agent groups separados

Cada ámbito tiene un agent group distinto, **contenedor, memoria, workspace, instrucciones y sesiones distintos**. El recomendado si hay fronteras reales entre clientes, miembros de equipo, datos personales y laborales.

**Adecuado:** un bot personal y otro bot de trabajo; varios clientes/usuarios con acceso diferente.  
**Matiz:** aunque estén separados a nivel aplicativo y de filesystem, **el host, el Docker daemon, el gateway de credenciales y el sistema operativo siguen siendo infraestructura compartida**. Para adversarios mutuamente hostiles, considera VPS/VM separadas.

### Tabla de elección

| Escenario | Configuración |
|---|---|
| Tu Telegram + tu Discord | mismo agente, sesiones separadas |
| GitHub webhook + Slack de la misma iniciativa | sesión compartida, con decisión expresa |
| Amigo A y amigo B | agentes separados |
| Proyecto personal + datos de empresa | agentes separados |
| Distintos clientes con NDA o secretos | agent groups separados; valorar además VMs distintas |

Referencia exacta: https://github.com/nanocoai/nanoclaw/blob/main/docs/isolation-model.md

## 4. Requisitos

Documentación oficial v2:

- **Linux o macOS**, Windows mediante **WSL2**.
- **Node.js 22+** y **pnpm 10+** (el script actual puede instalarlos si faltan).
- **Docker Engine** en Linux o Docker Desktop en macOS/Windows.
- **Claude Code** para personalizaciones guiadas, instalación de skills de canales y recuperación de errores de setup.
- Una credencial o suscripción compatible con el proveedor seleccionado. Por defecto se usa Anthropic; otros proveedores necesitan su integración apropiada.
- Red saliente y recursos para Docker, el host, los contenedores y el gateway de credenciales.

### Hardware: propuesta de inicio, no requisito oficial

Para probar en una VPS con modelos remotos y pocas conversaciones, comenzaría con **2–4 vCPU, 4 GB RAM y 30 GB SSD** y mediría. Si lanzas muchas sesiones/agentes en paralelo, escalas memoria de contenedor y consumo de CPU. El usuario puede limitar concurrency/budgets mediante su despliegue y proveedor, pero **no se proporcionan aquí parámetros Docker concretos no documentados para el instalador**; inspeciona cómo genera contenedores tu commit y ensáyalos.

## 5. Instalación de v2 en Linux (camino principal)

### 5.1 Preparar entorno

Para una VPS Ubuntu/Debian, el diseño de usuario y paquetes siguiente es **propuesta operativa**:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
# Instala Docker Engine/Compose y verifica que el daemon es operativo.
docker version
docker info
node --version     # objetivo >=22
pnpm --version     # objetivo >=10
```

**Seguridad Docker:** ser miembro del grupo `docker` confiere prácticamente privilegios de administración del host en un daemon rootful. Por eso no debes tratar una cuenta con acceso al socket Docker como «usuario de servicio aislado». Usa una VPS dedicada al experimento o un administrador de confianza. **Nunca** proporciones `/var/run/docker.sock` como volumen del agente.

### 5.2 Clonar y registrar versión

```bash
git clone https://github.com/nanocoai/nanoclaw.git nanoclaw-v2
cd nanoclaw-v2
git rev-parse HEAD
# Guarda ese SHA en tu inventario de infraestructura.
```

Revisa `nanoclaw.sh`, archivos de setup, Dockerfile, política de credenciales y skills que se van a instalar, especialmente si es una máquina con datos personales. El script de setup **puede instalar componentes del sistema** y, si falla, delegar diagnóstico/reparación a Claude Code; no debe ejecutarse a ciegas en un host de producción sensible.

### 5.3 Ejecutar onboarding oficial

```bash
bash nanoclaw.sh
```

El README afirma que el asistente actual instala/prepara Node, pnpm y Docker si faltan, configura un gateway de credenciales, registra la credencial Anthropic, construye contenedor y empareja el primer canal: Slack, Telegram, Discord, WhatsApp, iMessage o CLI local, según entorno. Puede invocar Claude Code automáticamente si hay fallos. **Lee las operaciones que propone y usa credenciales de prueba con pocos privilegios**.

**Flujo sugerido para VPS headless:**

1. Escoge CLI local o Telegram como **primer canal**; minimiza integraciones hasta verificar el aislamiento.
2. Declara explícitamente qué usuario es el **owner**, quién puede administrarlo y cuál es la política para remitentes desconocidos.
3. Crea un solo agente de prueba con workspace vacío.
4. Comprueba que la respuesta sale del contenedor y que la credencial se usa a través del gateway.
5. Solo entonces añade más canales y grupos.

La configuración exacta y pantallas cambian: esta guía **no inventa** prompts del instalador, nombres de servicio systemd ni flags adicionales.

## 6. Conectar Telegram y otros canales

En v2 las integraciones se añaden mediante skills. El README indica `/add-telegram`, `/add-discord`, `/add-opencode`, etc.; **los comandos con `/` se ejecutan dentro del prompt de Claude Code**, no directamente en bash.

### Ejemplo Telegram

1. Crea bot con `@BotFather`.
2. En tu checkout v2 abre Claude Code:

   ```bash
   cd nanoclaw-v2
   claude
   ```

3. Dentro de Claude Code solicita la skill:

   ```text
   /add-telegram
   ```

4. Sigue el flujo específico: registro del canal, token, propietario, vinculación con el agent group y política para remitentes desconocidos.
5. Prueba mensajes desde tu cuenta y **desde una segunda cuenta no autorizada**.
6. Verifica que mensajes no confiables no reciben permisos administrativos por mencionar una keyword.

Si ya has emparejado Telegram durante `bash nanoclaw.sh`, **no repitas sin motivo** la instalación del canal. Consulta el estado de tu instalación y la documentación del skill.

### Canales extra

El repo cita, entre otros, Slack, Discord, WhatsApp, iMessage, Microsoft Teams, Matrix, Google Chat, Webex, Linear y GitHub. La lista **no equivale a que todos estén preinstalados**. Las skills añaden módulos del branch de canales y dependencias concretas al fork. Antes de dar permisos a Slack/GitHub/Gmail, crea credenciales con scopes mínimos y prueba revocación.

## 7. Gateway de credenciales y políticas

### Por qué importa

En v2, el README presenta un credential gateway que inyecta secretos **en el tráfico de salida** sin dar la clave bruta al contenedor. Durante setup se instala uno de los gateways admitidos —el README menciona actualmente **OneCLI Agent Vault**—; se pueden aplicar reglas por agente y controles de tasa.

Esto reduce el riesgo de que un prompt malicioso use `cat /proc/...` o inspeccione variables del contenedor para encontrar una API key **si efectivamente la clave no se monta ni entra como variable**.

### Límite crítico: modo secreto por defecto

Las notas v1→v2 indican que los agentes creados automáticamente pueden partir de un modo de secretos **`all`**, que permite inyección automática de secretos cuyos patrones de host coincidan. Para separación fuerte, **revisa y cambia a modo `selective`** según la interfaz y la ayuda de la versión de OneCLI instalada; la referencia menciona `onecli agents set-secret-mode --mode selective` como familia de comandos. Ejecuta:

```bash
onecli agents --help
onecli agents set-secret-mode --help
```

La sintaxis concreta para identificar un agente depende de la release. No apliques un comando incompleto al objetivo equivocado. Añade reglas allowlist por host/API/agente y limita gasto por credencial en el proveedor.

**Nunca pongas tokens en:** mensajes, archivos visibles para todos los agent groups, instrucciones compartidas, imagen Docker o repositorio Git. Mantén el proceso host, los volúmenes de OneCLI y la cuenta Docker bajo control del administrador.

### Datos y diagnósticos

Según README, el producto no requiere cuenta propia para su funcionalidad básica y reporta diagnósticos anónimos de setup. Si quieres opt-out:

```bash
NANOCLAW_NO_DIAGNOSTICS=1 bash nanoclaw.sh
```

La obtención **optativa** de imágenes preconstruidas/perks comunitarios puede requerir cuenta y transmisión de metadatos asociados a ella. La compilación local es la vía por defecto descrita. Por separado, **las peticiones LLM al proveedor sí transmiten los contenidos necesarios para responder**, salvo que uses un modelo realmente local; “el proyecto no recoge tus mensajes” **no significa** “ningún servicio externo los ve”.

## 8. Aislamiento real: controles que debes revisar

### Docker y filesystem

- Ejecuta contenedores sin `--privileged`, sin acceso al socket Docker y con usuario restringido si el runtime lo permite.
- Evita montar el home completo, `~/.ssh`, repositorios de clientes ajenos, gestores de contraseñas y directorios cloud.
- Da **solo lectura** a materiales de consulta; monta escritura únicamente donde sea imprescindible.
- Separa carpetas de cada agent group y su memoria.
- Revisa `container.json` por grupo, volúmenes, mounts y permisos efectivos.
- Si un contenedor escribe en un bind mount, esa escritura afecta al host: **contenedor ≠ read-only**.

### Red y exfiltración

- Aunque no haya clave cruda dentro del contenedor, el agente podría **usar** una API permitida para hacer algo indebido, o sacar información por una salida de red si la conoce.
- Revisa las políticas de salida/hostnames del gateway y aplica firewall/egress por contenedor cuando proceda.
- Bloquea servicios de metadatos de nube (`169.254.169.254`) y hosts internos innecesarios si están al alcance de agentes no confiables.
- Un contenedor puede ser vulnerado y el daemon Docker/host también; considera actualizaciones de kernel, container runtime y dependencias.

### Control de identidades

- En v2 se definen roles de usuario `owner` y `admin` (globales o acotados), más membresía de grupos y política de remitentes desconocidos.
- Política de remitentes desconocidos: `strict`, `request_approval` o `public`, según documentación de migración. Prioriza `strict` o aprobación manual para un bot privado.
- **No des por supuesto** que un canal es privado solo por su nombre, una mención o un trigger word.

### Prompt injection y permisos

Incluso con Docker, un mensaje adversarial puede ordenar al agente borrar archivos de un volumen montado, filtrar datos accesibles o ejecutar herramientas conectadas. La frontera efectiva es la combinación de **alcance de volúmenes, red, secretos, permisos del servicio y roles**, no solo el prompt.

## 9. Proveedores/modelos alternativos

El stack v2 usa el **Claude Agent SDK** como proveedor de origen. El README enumera integraciones mediante skills:

- `/add-codex`: runtime OpenAI Codex, con la forma de autenticación que soporte la integración.
- `/add-opencode`: otros proveedores/modelos a través de OpenCode.
- `/add-ollama-provider`: modelos locales open-weight con Ollama.

Los comandos de skills se envían **dentro de Claude Code** desde el checkout. Su compatibilidad con un modelo concreto, manejo de herramientas y rendimiento debe verificarse caso por caso. No supongas que una API compatible garantiza todas las tool calls y el mismo comportamiento de memoria.

**Modelo por agent group:** documentado en el README; útil para reservar modelos potentes a trabajos críticos y baratos a resúmenes. Para evaluar coste real registra: requests, tokens de input/output, repeticiones de herramientas, errores de tool calling y horas de contenedor.

## 10. Personalización, templates y MCP

NanoClaw prefiere que cada persona posea su fork y adapte código/skills en lugar de crecer con cientos de flags. Consecuencias:

- Flexibilidad alta: puedes escribir nuevas integraciones y revisar el código que se ejecuta.
- Mantenimiento mayor: hay que gestionar tu fork al actualizar upstream.
- Riesgo de introducir vulnerabilidades durante “customize” automatizado; revisa el diff.

### Templates

La documentación v2 indica:

```bash
ncl groups create --template <ref>
```

Sustituye `<ref>` por una plantilla legítima y comprueba que el CLI `ncl` quedó instalado en tu entorno. Los templates combinan instrucciones, skills y MCP sin secretos. **Revisa** las herramientas que incorpora la plantilla antes de ejecutarla con credenciales reales. Referencia: https://github.com/nanocoai/nanoclaw/blob/main/docs/templates.md

### MCP / auto-modificación

El runner incorpora un registro de herramientas MCP, y las notas v2 mencionan flujos de auto-modificación para instalar paquetes o añadir servidores MCP con aprobación administrativa y reconstrucción de imagen. Revisa la versión actual de ese flujo: ejecutar un MCP de terceros es **añadir código al contexto de confianza del agente**.

## 11. Operación en VPS: supervisión y troubleshooting

El instalador gestiona sus propios servicios; los nombres exactos pueden depender del SO/canal y de la versión. Los comandos siguientes son **de diagnóstico de Docker**, no una API NanoClaw inventada:

```bash
cd nanoclaw-v2
git rev-parse --short HEAD
node --version
pnpm --version
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker stats --no-stream
docker system df
```

Para un contenedor identificado y confiable:

```bash
docker logs --tail=100 NOMBRE_O_ID_DEL_CONTENEDOR
# Examina mounts y límites antes de cambiar permisos:
docker inspect NOMBRE_O_ID_DEL_CONTENEDOR
```

El README recomienda, si falla el setup o comportamiento, abrir `claude` desde checkout y usar la skill `/debug`; trata las propuestas de cambios **como un PR**, no como órdenes que aprobar automáticamente.

### Tabla rápida de incidencias

| Problema | Revisión |
|---|---|
| El script no consigue levantar Docker | daemon, permisos de usuario, arquitectura, recursos del host |
| No responde Telegram | skill instalada, credencial, conexión saliente, routing group/owner |
| Recibe mensajes pero nadie puede administrar | roles owner/admin, sender policy, cuentas correctas |
| Mezcla memoria de dos chats | comprobar nivel 1/2/3 del modelo de aislamiento |
| El contenedor no encuentra un archivo | no está montado o no tiene permisos de lectura |
| Una API funciona desde host pero no desde agente | política del gateway, secreto asignado, hostname permitido, red |
| RAM excesiva | número de contenedores vivos/sesiones, modelos locales, jobs recurrentes |
| Fallo tras actualizar | cambios de v2, skill de canal, paquetes, branch local y migraciones de DB |

### Backups (propuesta operativa)

Registra y conserva de forma cifrada:

- commit SHA exacto de fork y archivos de personalización;
- **`data/`** (incluye DB central y por sesión), estado del gateway si corresponde;
- **`groups/`** y memoria/instrucciones;
- credenciales en **gestor de secretos separado** (no basta respaldar `.env`);
- estado/autenticación de canales, dependiendo del adaptador instalado;
- scripts/env de despliegue y manifiestos realmente usados.

**Realiza backups consistentes:** detén procesos apropiadamente o usa copia SQLite consistente; no copies indiscriminadamente bases activas por rsync y presupongas coherencia. Prueba restaurar en un entorno separado sin conectarlo a canales reales para evitar envíos duplicados.

### Actualización (propuesta operativa)

1. Backup + snapshot de VPS/volúmenes.
2. Anota SHA actual y revisa releases/changelog.
3. Trae cambios upstream en tu fork, resuelve conflictos de skills/modificaciones.
4. Revisa cambios en schema y gateway de credenciales.
5. Reconstruye/testea imagen y canales en una instalación *staging*.
6. Migra a producción con plan de rollback.

No uses `git pull` automático sin revisar si personalizaste código. La arquitectura «tu fork es tu producto» implica disciplina Git.

### Desinstalación oficial

El README describe:

```bash
bash nanoclaw.sh --uninstall --dry-run   # vista previa
bash nanoclaw.sh --uninstall             # solicita confirmaciones
```

La desinstalación puede borrar servicio, contenedores, imágenes, datos, logs y archivos del agente vinculados a ese checkout. Conserva backup **antes**, lee la vista previa y confirma que estás en la carpeta correcta. Las credenciales compartidas/gateway pueden sobrevivir y requerir revisión aparte.

## 12. Migración v1 → v2: cambios clave

- v1: un host Node con una BD SQLite para mensajes, grupos y tareas; v2: host + DB central + dos DB por sesión + contenedores Bun.
- v1: asociación chat→grupo relativamente plana; v2: usuarios, roles, messaging groups, agent groups y múltiples esquemas de sesión.
- v1: env/secrets más directos; v2: gateway de credenciales.
- v1: canales embebidos; v2: skills que copian/adaptan módulos a tu fork.
- v1: histórico de chats; **el migrador no conserva automáticamente todo el historial de mensajes** (la doc lo explicita).

El camino oficial es clonar **una instalación v2 limpia** al lado de v1 y ejecutar desde v2:

```bash
git clone https://github.com/nanocoai/nanoclaw.git nanoclaw-v2
cd nanoclaw-v2
bash migrate-v2.sh
```

El migrador detecta la v1 cercana o usa `NANOCLAW_V1_PATH=/ruta/a/v1`; copia componentes y luego Claude Code trata decisiones (owner, memoria, personalizaciones). **No hace automáticamente el switchover del servicio** si no se autoriza. Nunca migres directamente encima de la única copia de tus datos.

Fuente: https://github.com/nanocoai/nanoclaw/blob/main/docs/v1-to-v2-changes.md

## 13. Checklist de aislamiento para una prueba real

- [ ] Instalo v2 en una máquina/VM sin secretos personales.
- [ ] Guardo commit SHA y reviso `nanoclaw.sh` y Dockerfiles.
- [ ] Pruebo un único bot con owner verificado; remitentes desconocidos en `strict`/aprobación.
- [ ] Creo **dos agent groups** diferentes, cada uno con archivo y memory distintos.
- [ ] Compruebo que el agente A **no ve** el fichero exclusivo de B.
- [ ] Compruebo que B no conoce la memoria guardada en A.
- [ ] Reviso volúmenes de contenedores con `docker inspect`.
- [ ] Confirmo que ningún agente monta `/var/run/docker.sock` o el home completo.
- [ ] Aplico credenciales y scopes separados; verifico *secret mode selective*.
- [ ] Hago una prueba de prompt injection a partir de un texto de chat no confiable.
- [ ] Vigilo consumo Docker/RAM, tareas recurrentes y salida de red.
- [ ] Pruebo una recuperación desde backup y una parada limpia.

## 14. Fuentes oficiales

1. [README principal, instalación v2](https://github.com/nanocoai/nanoclaw)
2. [Modelo de aislamiento de canales/agentes](https://github.com/nanocoai/nanoclaw/blob/main/docs/isolation-model.md)
3. [Arquitectura](https://github.com/nanocoai/nanoclaw/blob/main/docs/architecture.md)
4. [Cambios de v1 a v2](https://github.com/nanocoai/nanoclaw/blob/main/docs/v1-to-v2-changes.md)
5. [Templates](https://github.com/nanocoai/nanoclaw/blob/main/docs/templates.md)
6. [Community portal opcional](https://github.com/nanocoai/nanoclaw/blob/main/docs/community-portal.md)
7. [Security](https://github.com/nanocoai/nanoclaw/blob/main/SECURITY.md)

**Conclusión:** NanoClaw es el que ofrece el argumento arquitectónico más sólido para separar **agentes, sesiones y filesystem**. Su principal coste operativo es gestionar Docker, un gateway de credenciales, los plugins/skills que copias al fork y actualizaciones de tu personalización. No lo confundiría con aislamiento fuerte entre clientes adversarios: para eso, añade separación a nivel VM/VPS.
