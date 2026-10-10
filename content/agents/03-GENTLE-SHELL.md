# Gentle Shell — guía de agente de programación Pi-native

**Revisado:** 10/10/2026  
**Repositorio:** https://github.com/Gentleman-Programming/gentle-shell  
**Referencia técnica:** https://github.com/Gentleman-Programming/gentle-shell/blob/main/docs/readme-reference.md  
**Lanzador:** `gentle-shell`; **nombre del paquete npm (todavía):** `gentle-pi`.

> En el README oficial revisado se muestra **gentle-pi v3.5.1** como publicación estable. Puede publicarse otra: contrasta npm, releases y `gentle-shell --version`. Las capacidades de `main` pueden adelantarse a esa release. Aquí se distinguen los comandos de la herramienta de recomendaciones de entorno.

## 1. Resumen y opinión de uso

Gentle Shell es un **harness de programación para Pi**. No busca competir directamente con un asistente personal de WhatsApp/Telegram; organiza cómo un agente trabaja en un repositorio: descubrir el problema, delimitar alcance, implementar, delegar partes a subagentes, mostrar cambios, registrar evidencia, aplicar controles de revisión y mantener continuidad entre sesiones. Su enfoque metodológico se llama **Organic Driven Development (ODD)**.

**Lo elegiría si:** programas a diario, te importan la revisión de diffs, la división de trabajo en agentes especializados y la continuidad de tareas largas. **No lo elegiría en lugar de nanobot/NanoClaw** para ser un bot privado 24/7 que monitoriza chats y automatiza la vida: es un producto distinto.

### Qué aporta sobre Pi

- Lanzador standalone que abre Pi con paquetes/skills/tema y home separado.
- Interfaz TUI/fullscreen de estado: modelo, uso, costes disponibles, cambios, TODO y agentes.
- **ODD:** explorar antes de cambiar, no sobrerregular tareas pequeñas, un documento persistente para tareas grandes.
- Subagentes especializados: explorar, implementar, comprobar, revisar, con resultado que vuelve al padre.
- **Gentle Changes:** diffs y rastreo de escrituras atribuidas a esta sesión y sus subagentes.
- Herramientas nativas de revisión, decisiones y preguntas.
- Perfiles por modelo/esfuerzo/rol, y pin por repositorio.
- Guardas de operaciones destructivas; modo YOLO *de sesión* con límites.
- Skills y paquetes complementarios: `gentle-engram`, MCP, acceso web, etc.

**Lo que no añade por arte de magia:** un sandbox de kernel, seguridad absoluta contra prompt injection, modelos gratis o memoria garantizada si no configuras su integración correspondiente.

## 2. Ecosistema y nomenclatura

```text
               usuario en terminal
                      |
                  gentle-shell
                      |
       lanza Pi + paquete gentle-pi
                      |
     ODD / prompts / skills / revisiones
            |                  |
       padre/orquestador    subagentes
            |                  |
       checkout Git / cambios / tests
                      |
       opcional: Engram / MCP / web
```

- **Pi:** el agente/CLI de programación sobre el que corre.
- **gentle-pi:** paquete npm con extensiones, skills, prompts, themes, configuraciones y bin `gentle-shell`.
- **Gentle Shell:** producto/launcher/experiencia TUI; el repo fue renombrado, el paquete todavía no.
- **Gentle AI:** software compañero y política/metodología; existen comandos `gentle-ai`, y el paquete puede provisionar activos a través de su binario fijado.
- **Gentle Dot:** otro producto de escritorio; no confundas instalador de Gentle Dot con este harness de programación.
- **Gentle Engram:** componente complementario de memoria, no la función central de `gentle-pi` instalada mágicamente en cualquier modalidad.

## 3. Requisitos

### Confirmados en documentación

- Runtime Node.js y npm para `npm i -g gentle-pi`.
- Un Pi disponible por alguno de los mecanismos del launcher: ejecutable especificado con `GENTLE_SHELL_PI`, Pi opcional incluido adyacente, o `pi` del PATH.
- El launcher requiere **Pi >= 0.99.1**, según la referencia técnica revisada.
- Un proveedor de LLM/modelo aceptado por Pi y autenticación correctamente configurada.
- Git y un repositorio real para aprovechar ODD, diffs, ramas y review.
- Terminal capaz de ejecutar aplicaciones TUI; para panel lateral fullscreen es más cómodo uno ancho.

El instalador gráfico de la web/releases puede gestionar Node, pnpm y Pi, pero la ruta npm es más transparente para usuarios técnicos. Usa una versión de Node LTS mantenida y compatible; **no inventamos aquí un mínimo Node exacto** distinto del exigido por el npm package en tu versión.

### Recursos y coste

El consumo lo determinan la TUI, los modelos y especialmente los **subagentes simultáneos**. Un plan de trabajo con cinco workers puede generar más llamadas/coste que un solo agente incluso si el launcher pesa poco. Pi/Gentle Shell es un runtime orquestador: si ejecuta tests pesados, la CPU y RAM vendrán sobre todo del propio proyecto.

## 4. Instalación recomendada: standalone aislado

Ruta documentada como principal:

```bash
npm i -g gentle-pi
# Verifica qué se instaló
gentle-shell --version
# Comienza en su propio home
gentle-shell
```

### Dónde guarda su estado

- Home standalone por defecto: **`~/.gentle-shell/agent`**.
- Configuración de preferencia de home: **`~/.gentle-shell/config.json`**.
- Home de Pi habitual: **`~/.pi/agent`**.
- Configuración interna de Gentle AI: normalmente **`~/.pi/gentle-ai`** para parte de perfiles/opciones globales; la ruta efectiva puede variar con variables/config.
- El launcher puede crear en su primer arranque configuración visual y ejecutar autoprovisionado de complementos de Gentle AI en su **propio** home aislado.

**Importante:** “home aislado” significa **directorio de configuración distinto**, **no** contenedor Docker ni aislamiento del sistema operativo. El proceso Pi puede seguir leyendo/escribiendo archivos a los que tenga permiso Unix.

### Primera ejecución

En el standalone actual, la primera ejecución configura el home aislado y puede realizar `setup` automáticamente. Para repetir aprovisionamiento y ver su salida:

```bash
gentle-shell setup
```

Para inspeccionar la versión y home:

```bash
gentle-shell --version
gentle-shell home
```

No necesitas llamar a `gentle-shell install npm:gentle-pi` en el home aislado: el launcher ya inyecta su propia copia de ese paquete. Instalar otra copia a mano puede originar conflictos de herramientas o drift de versión.

### Inicio en un proyecto

```bash
cd /ruta/a/tu-repositorio
git status --short
gentle-shell
```

Comienza por una tarea **read-only**, por ejemplo: «Explora la arquitectura, señala riesgos y prepara un plan; no modifiques archivos». Después prueba un cambio pequeño con test y revisión.

## 5. Ruta alternativa: reutilizar un Pi ya configurado

```bash
# Si ya tienes ~/.pi/agent con login, modelos y chats:
gentle-shell --link
```

Este flag **usa el home del Pi existente** y reutiliza sesiones/credenciales/modelos. No se recomienda como primera prueba si tienes un Pi muy personalizado: comienza aislado para evitar colisiones de plugins.

Para hacer del modo link el comportamiento habitual:

```bash
gentle-shell home link
gentle-shell home
```

Para volver al modo aislado:

```bash
gentle-shell home isolated
gentle-shell home
```

Para un home arbitrario:

```bash
gentle-shell --home /ruta/a/otro/agent
gentle-shell home /ruta/a/otro/agent
```

La primera forma selecciona el home de esa invocación; la segunda **persiste** elección para próximas. **Los flags `--link`, `--isolated` y `--home` son mutuamente excluyentes**.

## 6. Instalar dentro de un Pi existente (sin launcher standalone)

La ruta B del README:

```bash
# Requiere que el comando 'pi' funcione antes:
pi install npm:gentle-pi@3.5.1
# Reinicia Pi y ejecuta la sincronización indicada:
gentle-ai sync
# Abre Pi en el repositorio:
pi
```

El comando/versionado `gentle-pi@3.5.1` es el ejemplo de stable documentado **en la fecha de esta guía**; consulta la release oficial antes de fijarlo para tu entorno. La ruta B modifica el **home de Pi existente**, a diferencia de la ruta standalone aislada. Registra o haz backup de `~/.pi/agent/settings.json` y assets antes.

No mezcles ruta A y B indiscriminadamente. El launcher tiene lógica para evitar cargar dos extensiones con los mismos tools en algunos modos, pero sigue siendo más simple elegir una estrategia de instalación por home.

## 7. Alternativa gráfica/instalador de releases

El README también documenta descargas de instaladores para macOS, Windows y Linux. Son descargables desde las **releases oficiales**; comprueba checksums SHA-256 cuando existan. El instalador gráfico web/browser es descrito como *preview* y las ejecuciones limpias macOS/Windows aún estaban bajo comprobación en los textos revisados.

Si te interesa la opción desde código fuente:

```bash
git clone https://github.com/Gentleman-Programming/gentle-shell.git
cd gentle-shell
sh scripts/bootstrap.sh  # macOS/Linux; verificar script antes de ejecutar
```

El instalador puede descargar Node/pnpm temporalmente, y solicita confirmación del plan antes de instalar. No lo ejecutes con privilegios elevados sin motivo. En Windows sigue los `.cmd` oficiales y las rutas publicadas; no traslades literalmente el script Linux.

## 8. Organic Driven Development (ODD), paso a paso

ODD no significa «planificar durante horas cada cambio». Pretende ajustar esfuerzo y trazabilidad al riesgo y continuidad.

### Ciclo documentado

1. **Autorizar:** una petición de inspección se mantiene read-only salvo permiso de implementación.
2. **Explorar:** revisar código, tests, documentación y convenciones antes de cambiar.
3. **Resolver incertidumbre:** investigar o preguntar solo sobre decisiones materialmente abiertas.
4. **Clasificar:** tarea pequeña si se entiende y puede reanudarse con el prompt + `git diff`; grande si eso no basta.
5. **Registrar trabajo grande:** crear artefacto durable **`odd/tasks/<nombre>.md`** y, si Engram está operativo, espejo de memoria.
6. **Implementar por tareas:** decidir el camino más seguro, aplicar tests según modo TDD, cerrar unidades con commits/evidencias cuando corresponda.
7. **Cerrar:** resumen de resultado comprobado, tests pasados/fallidos, riesgos y próximos pasos.

La referencia indica que un umbral alrededor de 400 líneas de cambio es solo **orientativo**, no una prohibición ni un método para dividir artificialmente trabajo.

### Micro-ejemplo de uso

**Prompt sugerido para exploración:**

> Inspecciona esta base de código. Identifica la ruta de autenticación, sus dependencias, tests existentes y riesgos. No modifiques archivos ni ejecutes migraciones destructivas. Entrega hipótesis verificadas y preguntas abiertas.

**Prompt sugerido para ejecución acotada:**

> Implementa validación de expiración de tokens en el módulo X, sin modificar contratos públicos no implicados. Primero localiza tests, después cambia lo mínimo necesario, ejecuta tests focalizados, muestra diff y detén cualquier operación destructiva para confirmación.

**Prompt sugerido para trabajo grande:**

> Necesito integrar SSO en varios servicios. Explora el estado actual y determina si se requiere una feature ODD persistente. Propón tareas separables, criterios de aceptación, secuencia de implementación, riesgos y evidencia exigida. No toques producción ni credentials.

**Conserva el control:** para ramas principales, migraciones de datos, pushes/PRs públicos y secretos, exige revisión humana y CI adicional. La metodología del agente es una ayuda, no un control de acceso de GitHub.

## 9. Subagentes y orquestación

Gentle Shell incorpora agentes focalizados para explorar, implementar y comprobar; un **padre/orquestador** mantiene responsabilidad sobre alcance, decisiones y resumen. En la TUI se visualiza actividad, modelo, tokens, coste cuando esté disponible, historial e interrupciones.

- **Para qué delegar:** tareas independientes, análisis paralelo o aislamiento de contexto.
- **Cuándo no:** para cambiar tres líneas sencillas, donde la coordinación cuesta más que la ejecución.
- **Prevención de conflictos:** define archivos/objetivos por worker, evita que dos escritores cambien la misma API sin coordinación, usa branches/worktrees cuando convenga.
- **Verificación:** el padre integra resultados y ejecuta tests; no asumas que “worker finished” implica que todas sus modificaciones quedaron aprobadas.
- **Coste:** cada subagente gasta sus propias llamadas; controla modelos y esfuerzo por rol.

### Interfaz y atajos documentados

- `Alt+A`: visor de agentes en vivo.
- `Alt+G`: visor de Gentle Changes.
- `Alt+K`: paleta de comandos.
- `/gentle:customize`: personalización de layout y paneles.
- `/gentle:stats`: estadísticas locales de uso, modelos y costes registrados.

Los atajos pueden depender del emulador de terminal y de cómo capture Alt/Option. Prueba en un terminal conocido antes de asumir que falló el plugin.

## 10. Gentle Changes y revisión nativa

### Gentle Changes

Recoge **escrituras/ediciones exitosas** realizadas por las herramientas del agente y sus subagentes asociados a la sesión. Muestra archivos, líneas modificadas y diffs, con posibilidad de abrir archivos en editor.

**Advertencia específica de la documentación:** no registra necesariamente todos los cambios hechos por shell, procesos externos o ejecuciones fallidas. Por tanto **ausencia de entrada en Changes ≠ repositorio limpio**.

Antes de hacer commit verifica también:

```bash
git status --short
git diff --stat
git diff --check
git diff
```

### Revisión nativa

Gentle Shell ofrece revisión del candidato acotado (work unit / PR slice) y reportes de riesgos con evidencia. La revisión **no sustituye** los tests, reglas de protección de rama ni aprobación de otra persona para cambios de alto impacto.

Recomendación de pipeline humano:

1. `git status` antes; crea rama de feature.
2. El agente explora y modifica.
3. Tests unitarios/lint + tests de integración necesarios.
4. Gentle Changes + revisión nativa.
5. Revisión de `git diff` sin confiar solo en narrativas del agente.
6. Commit/PR; CI y revisor humano si se requiere.

## 11. Comandos clave

### Lanzador (terminal externo)

| Comando | Qué hace |
|---|---|
| `gentle-shell` | Abre con home seleccionado, aislado por defecto |
| `gentle-shell --version` | Muestra versión Gentle Shell, Pi y home |
| `gentle-shell --link` | Reutiliza home de Pi existente |
| `gentle-shell --isolated` | Fuerza home standalone |
| `gentle-shell --home /ruta` | Home personalizado para esa ejecución |
| `gentle-shell home` | Muestra modo y ruta efectivos |
| `gentle-shell home link` | Guarda link como elección por defecto |
| `gentle-shell setup` | Provisiona complementos del home seleccionado |
| `gentle-shell setup --dry-run` | Simula provisionado del home seleccionado |
| `gentle-shell list` | Lista paquetes Pi del home efectivo |
| `gentle-shell install npm:paquete` | Instala paquete Pi en ese home |
| `gentle-shell update` | Actualiza paquetes de **Pi en ese home**, no necesariamente launcher |
| `gentle-shell upgrade` | Actualiza Gentle Shell según canal release/main |
| `gentle-shell --mode rpc` | Pasa a Pi el modo RPC cuando el runtime lo soporte |

La ubicación del flag importa: `gentle-shell --link install npm:pi-web-access` opera sobre Pi enlazado. No instales complementos en el home equivocado por confundir `--link`.

### Comandos dentro de la sesión (TUI)

| Comando | Uso |
|---|---|
| `/gentle:customize` | Estilo, panel, UI y opciones sesión |
| `/gentle:models` | Asignación de modelos/roles según integración |
| `/gentle:profiles` | Perfiles de routing por agente |
| `/gentle:stats` | Historial local de uso/coste |
| `/gentle:status` | Información de estado/diagnóstico |
| `/gentle:doctor` | Diagnóstico de configuración/runtime |
| `/gentle:yolo` | Menú de permisos rápidos de la sesión |
| `/gentle:yolo status` | Consulta si YOLO está habilitado |
| `/gentle:yolo enable` | Autoriza acciones ordinarias acotadas, no destructivas |
| `/gentle:yolo disable` | Revoca permisos de YOLO |

Si algún comando no aparece en tu build, verifica con la paleta `Alt+K`, release y documentación. No se deben presuponer todos los subcomandos de `main` en releases antiguas.

## 12. Perfiles de modelos por rol

Puedes combinar modelos económicos para exploración y modelos más fuertes para decisiones complejas. Gentle Shell admite perfiles nombrados y asignación independiente por rol, con posible pin por repositorio.

**Ideas de perfiles (ejemplo conceptual, no configuración oficial lista para pegar):**

- `fast`: orquestador modelo ágil, investigador económico, checks focalizados.
- `deep-work`: orquestador y revisor de mayor capacidad; subagentes limitados a lo justificable.
- `offline`: cuando el proveedor/modelo y herramientas sean realmente compatibles con ejecución local.

La referencia documenta perfiles en **`~/.pi/gentle-ai/profiles.json`** y dos tipos de pin:

- **Local del clone Git:** `<git-common-dir>/gentle-ai/profile-pin.json`, sin versionar.
- **Declaración de repo:** `<worktree-root>/.pi/gentle-ai/profile.json`, normal y versionable.

El panel `/gentle:profiles` es preferible a editar a mano el JSON. Anclar un perfil impide que un cambio global de modelos altere inadvertidamente el siguiente subagente en un repositorio dado.

**No copies IDs de modelos sacados de ejemplos viejos.** Autentica el proveedor en Pi y escoge IDs realmente disponibles para tu cuenta.

## 13. Memoria y complementos recomendados

### ¿Hay memoria por defecto?

No conviene afirmar simplemente «Gentle Shell siempre recuerda todo». Su paquete principal tiene continuidad ODD con artefactos en repo; **la memoria persistente de Engram es una integración complementaria**. En modo standalone actual, el `setup` inicial puede provisionar Engram y otros complementos automáticamente, según la versión del `gentle-ai` fijado.

Para inspeccionar paquetes existentes:

```bash
gentle-shell list
```

Compañeros citados por documentación técnica (la lista exacta puede variar por release):

```bash
# Ejemplos; instala solo si NO están ya provisionados:
gentle-shell install npm:gentle-engram
gentle-shell install npm:pi-web-access
gentle-shell install npm:pi-intercom
gentle-shell install npm:pi-lens
```

El `setup` moderno puede instalar **otros** módulos como `pi-mcp-adapter` o `pi-btw`, y eliminar automáticamente alguno incompatible con su tool nativo. Por ello, **antes de tocar nada ejecuta `gentle-shell list`** y evita reinstalar paquetes conflictivos que el propio setup retira.

### Qué guardar

- Configuración/homes si quieres continuidad entre equipos.
- Artefactos ODD versionados en proyecto, especialmente `odd/tasks/*.md`.
- Memoria/DB de Engram si estás usando ese companion; sigue su backup oficial.
- Historial de chats si lo necesitas, conforme a tus políticas de privacidad.
- Secrets y tokens **por separado** con gestor de credenciales.

No subas `~/.pi/agent`, `~/.gentle-shell/agent` o bases de memoria enteras a un repo público.

## 14. Seguridad: qué protecciones existen y cuáles no

### Guardas y confirmaciones

La herramienta documenta guardas de operaciones destructivas (por ejemplo, reescrituras peligrosas, cambios fuera de scope), revisión y decisiones de usuario. Puede cambiar según versión/configuración. No debes confiar exclusivamente en el texto de la política del agente para proteger archivos críticos.

### El modo YOLO

`/gentle:yolo enable` permite evitar preguntas repetidas para trabajo **ordinario ya acotado** en la sesión interactiva. Según README, quedan controles destructivos, confirmaciones obligatorias, decisiones de credenciales/destino, límites de sesión y límites a subagentes. Por defecto está **OFF**; se resetea con reload/sustitución de sesión.

**Regla práctica:** habilítalo solo en repositorios personales/temporales con rama y backup, si has revisado el alcance. **No es un sandbox** ni permite dar permisos del SO que el proceso ya no poseía. El agente sigue ejecutando código con los permisos del usuario que lo lanzó.

### Endurecimiento sugerido

- Usa un usuario Linux/macOS sin privilegios para trabajos no confiables.
- Para repos externos sospechosos, ejecuta Pi/Gentle Shell en un **devcontainer/VM** con permisos limitados; esto es propuesta adicional, no característica inherente de Gentle Shell.
- Mantén secrets de producción fuera del clone y fuera de los permisos del runner.
- No abras `--mode rpc` en TCP público; verifica autenticación/transportes del host que lo exponga.
- Delega solo a subagentes con scope explícito; no actives push/despliegue automáticos.
- Protege `main` con branch protection y CI en plataforma Git.
- Revisa scripts `postinstall`/paquetes npm antes de actualizar.
- No confíes ciegamente en documentación externa, issues o README que el modelo lea: son fuentes de prompt injection.

### Telemetría

La referencia técnica contempla un comando interno `/gentle:telemetry disable` y variables como `DO_NOT_TRACK=1` o `GENTLE_AI_TELEMETRY=0` para deshabilitar telemetría asociada en determinados componentes. Si necesitas política sin telemetría, comprueba estado y exclusiones de la versión real que despliegues; no presupongas que esas variables controlan otros paquetes de terceros o llamadas a modelos.

## 15. Operación, actualización y recuperación

### Inspección básica

```bash
node --version
npm --version
gentle-shell --version
gentle-shell home
gentle-shell list
# Verifica repo activo:
git status --short
```

Dentro de la TUI ejecuta `/gentle:doctor` y `/gentle:status` cuando estén disponibles en tu versión.

### Diferencia fundamental: `update` vs `upgrade`

```bash
# Actualiza los paquetes Pi instalados en el home seleccionado:
gentle-shell update

# Actualiza el launcher Gentle Shell en su canal actual:
gentle-shell upgrade

# Cambia/selecciona release si fue configurado canal de desarrollo:
gentle-shell upgrade --channel release
```

La referencia contempla canal **`release`** y canal **`main`**. El segundo puede compilar componentes de desarrollo y requerir Go/pnpm; para entorno estable y reproducible, empieza por **release** y fija versión/commit a nivel de instalación cuando sea posible.

### Backup (propuesta operativa)

1. Termina sesiones activas y deja el repositorio en estado Git conocido.
2. Guarda configuración de `~/.gentle-shell/`, `~/.pi/agent/` solo si corresponde, `~/.pi/gentle-ai/` y DB de Engram si se usa.
3. Aplica cifrado y evita difundir tokens/model credentials.
4. Conserva lockfiles, versión de Node, versión de Pi y de `gentle-pi`.
5. En proyectos, conserva el trabajo por Git, no solo mediante backup del home.

### Problemas frecuentes

| Síntoma | Solución de investigación |
|---|---|
| `gentle-shell: command not found` | npm global bin PATH, versión de Node/npm, instalación global efectiva |
| No encuentra Pi | `GENTLE_SHELL_PI`, paquete Pi adjunto o `pi` en PATH; versión >=0.99.1 |
| Credenciales no aparecen | ¿home isolated o link? autentica en el home correcto |
| Duplicated tool `ask_user_question` | dos extensiones instaladas; evita duplicar `gentle-pi` o paquete de pregunta retirado |
| `setup` falla | revisa dependencia/binario local Gentle AI, versión y mensajes de error; usa `setup --dry-run` |
| No hay memoria entre sesiones | comprobar `gentle-engram`, inicialización, archivo ODD y home |
| No aparecen Changes | cambios realizados externamente/shell; usar `git diff` para verdad del repositorio |
| Los subagentes gastan demasiado | reducir fan-out, ajustar perfiles y roles, acotar scope |
| Panel se ve raro en terminal | anchura TUI, terminal compatible, `/gentle:customize` |
| YOLO sigue pidiendo confirmación | acciones destructivas/ambiguas mantienen consentimiento, esto es esperado |

## 16. Ejemplo práctico: flujo seguro en repo Python/TypeScript

1. Prepara un proyecto de ejemplo e instala dependencias siguiendo sus scripts auditados.
2. Crea una rama:

   ```bash
   git switch -c feat/validacion-sesiones
   ```

3. Ejecuta Gentle Shell:

   ```bash
   gentle-shell
   ```

4. Primera petición: «Explora cómo se validan las sesiones y propón pruebas de expiración sin editar».
5. Segunda petición: «Implementa solo el caso validado y ejecuta tests focalizados».
6. Abre `Alt+G`, revisa cambios; revisa también `git diff` y tests externos.
7. Si el trabajo crece, pide una feature ODD recuperable con criterios de aceptación explícitos.
8. Si conviene, permite un subagente para tests/documentación en scope independiente; verifica integración.
9. Antes del commit, comprueba que no se han añadido secretos ni artefactos temporales:

   ```bash
   git status --short
   git diff --check
   git diff --stat
   git diff
   ```

10. Revisión humana y, si corresponde, CI antes de merge.

## 17. ¿Conviene ejecutarlo en VPS?

**Sí, técnicamente por SSH**, siempre que tengas Node, Pi, Git y credenciales, pero no es su caso ideal para presencia permanente. Lo usaría en:

- Portátil/estación de trabajo donde desarrollas.
- VM/devcontainer de desarrollo con un repositorio montado.
- VPS dedicada **a desarrollo/CI experimental** bajo usuario de permisos limitados, sin datos privados ajenos.

No lo pondría en el mismo usuario/sistema que alberga el gateway de un asistente con acceso a todos tus chats y archivos personales. En una arquitectura mixta, conecta **mediante tickets/PRs** y permisos restringidos, no mediante una shell privilegiada persistente.

## 18. Checklist de adopción

- [ ] Instalo con `npm i -g gentle-pi` y compruebo `gentle-shell --version`.
- [ ] Inicio en home aislado antes de usar `--link`.
- [ ] Identifico proveedor/modelo real y qué credenciales puede leer.
- [ ] Pruebo trabajo read-only y luego cambio pequeño en rama de prueba.
- [ ] Compruebo `git diff` junto con Gentle Changes.
- [ ] Si uso ODD largo, reviso `odd/tasks/*.md` y criterios de aceptación.
- [ ] Inspecciono qué companion packages/memoria están instalados.
- [ ] Pruebo un subagente con tarea independiente y mido tokens/coste.
- [ ] Mantengo YOLO OFF en proyectos sensibles.
- [ ] Preparo rollback de paquete/Node/Pi antes de upgrades.
- [ ] Protejo credenciales y Git y no asumo que el home aislado es un sandbox.

## 19. Referencias oficiales

1. [README Gentle Shell](https://github.com/Gentleman-Programming/gentle-shell)
2. [Referencia técnica extensa](https://github.com/Gentleman-Programming/gentle-shell/blob/main/docs/readme-reference.md)
3. [Documentación del workspace](https://github.com/Gentleman-Programming/gentle-shell/blob/main/docs/gentle-shell.md)
4. [Releases/changelog](https://github.com/Gentleman-Programming/gentle-shell/releases)
5. [Sitio Gentle AI](https://gentle-ai.gentlemanprogramming.com/)

**Conclusión:** Gentle Shell no es el más adecuado para sustituir a un bot personal en VPS, pero sí es una de las propuestas más interesantes para que un agente de código trabaje con **contexto recuperable, subagentes, control de versiones y evidencias revisables**. Instálalo standalone primero y no confundas su aislamiento de configuración con aislamiento de seguridad.
