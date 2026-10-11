# AgentRepo CLI

Instalador de skills por proyecto, con versiones exactas declaradas en `agent.json`.
Requiere Node.js 24 o posterior y pnpm. Instala skills publicadas del catálogo;
las guías de proyectos de agentes no son instaladores de sus runtimes.
Nunca ejecuta el contenido descargado.

## Uso

Instala una vez y ejecuta `agentrepo` dentro de tu proyecto:

```sh
pnpm add -g https://github.com/luisobz/agentrepo.dev/releases/download/cli-v0.2.1/agentrepo-cli-0.2.1.tgz
```

Dentro de tu proyecto:

```sh
agentrepo
```

Requiere Node.js 24+ y pnpm. Si pnpm pide configurar el PATH global, ejecuta
`pnpm setup` y abre otra terminal. El asistente permite instalar, añadir skills,
verificar, restaurar snapshots y elegir herramienta. Crea `agent.json` y recuerda
el target. Enter selecciona `.agents/skills`. Sin TTY muestra ayuda sin modificar
el proyecto.

Comandos directos:

```sh
agentrepo skill2
agentrepo verify
agentrepo install
agentrepo reset --hard
```

`skill2` es ilustrativo: utiliza un slug publicado. También admite `skill2@1.0.0`.
Sin sufijo se elige la última versión y se guarda como versión exacta; `@latest` es opcional. Una adición fallida
no modifica el manifiesto ni los snapshots anteriores.

```json
{
  "schemaVersion": 1,
  "target": "claude",
  "skills": { "code-review": "1.0.0" }
}
```

Los slugs del ejemplo no garantizan disponibilidad. `skills` requiere versiones
exactas; los comandos resuelven `latest`. `target` es opcional, con fallback
`.agents/skills`. `registry` es opcional y predetermina
`https://agentrepo.dev/web/api/v1`; alternativas deben ser HTTPS sin credenciales,
query ni fragmento.

| Target         | Carpeta del proyecto |
| -------------- | -------------------- |
| agents / codex | `.agents/skills`     |
| claude         | `.claude/skills`     |
| cursor         | `.cursor/skills`     |
| copilot        | `.github/skills`     |

Rutas documentadas por [Codex](https://developers.openai.com/blog/skills-agents-sdk),
[Claude Code](https://code.claude.com/docs/en/skills), [Cursor](https://cursor.com/docs/skills)
y [GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills).

`reset --hard` exige un lock compatible y restaura los snapshots gestionados y
los permisos de solo lectura. No actualiza versiones, no borra código ni archivos
ajenos y sigue rechazando symlinks o mutaciones remotas. Si se forzaron permisos
para añadir archivos ajenos dentro de una skill, muévelos fuera antes de
restaurar: nunca se eliminan silenciosamente.

<details>
<summary>Opciones avanzadas y CI</summary>

Se conservan `init`, `--cwd`, `--target`, `--yes` y `--frozen-lockfile` para
compatibilidad y automatización. Un target explícito al instalar se recuerda.
El lock es portable entre herramientas.

```sh
agentrepo install --frozen-lockfile
```

</details>

## Snapshots fijos de solo lectura

Cada skill se materializa en `<destino>/<slug>/SKILL.md`. Su archivo queda con
permisos `0444` y su carpeta `0555` en sistemas POSIX: los editores y procesos
ordinarios no pueden escribir ni añadir archivos allí. No se ofrecen ediciones
directas; personalizar una skill requiere publicar otro slug o una versión nueva.

`agent-lock.json` fija versión, SHA-256 del contenido publicado y SHA-256 del
archivo instalado. También queda de solo lectura. Guarda `agent.json` y el lock
en Git y revisa sus cambios. Añade `.agentrepo/` a `.gitignore`: contiene el
estado local de propiedad y el bloqueo de instalaciones concurrentes.

- `verify` comprueba versión, contenido, permisos y archivos adicionales contra
  el lock y el snapshot remoto. No modifica archivos.
- `install` restaura contenido gestionado alterado y vuelve a aplicar solo lectura.
  Si el servidor cambia el contenido de una versión ya fijada, falla por integridad
  y conserva la instalación anterior.
- Para actualizar, cambia la versión exacta en `agent.json` y ejecuta `install`:
  se reemplaza el snapshot completo, sin mezclar ediciones locales.
- `install --frozen-lockfile` exige un lock compatible y no lo reescribe; úsalo en CI.
- No se sobrescriben carpetas ajenas ni se siguen symlinks. Si alguien fuerza los
  permisos y añade archivos desconocidos, se conservan y se solicita moverlos
  fuera antes de restaurar el snapshot. Quitar una skill del manifiesto elimina
  únicamente su archivo gestionado del target seleccionado.

La instalación descarga y valida todo antes de sustituir archivos, y restaura
los anteriores si una escritura falla. Una instalación interrumpida puede dejar
`.agentrepo/install.lock`: comprueba que no siga en ejecución antes de retirarlo.

### Límite de la garantía

Solo lectura evita ediciones accidentales y escrituras ordinarias; no constituye
una barrera frente al propietario que cambie permisos, root, un sistema comprometido
o una herramienta que deliberadamente reemplace carpetas desde su directorio padre.
En Windows no se garantiza la misma protección de permisos POSIX; se mantiene la
comprobación de integridad. El lock detecta cambios posteriores a la primera
instalación, pero no es una firma del editor ni acredita que una skill nueva sea
segura. Revisa el origen y las instrucciones antes de confiar en ellas. El CLI no
vigila continuamente los archivos durante la ejecución de un agente: ejecuta
`verify` antes de usar las skills si necesitas esa comprobación.

## Desarrollo

Desde la raíz del monorepo:

```sh
pnpm exec nx test cli
pnpm exec nx lint cli
pnpm --dir packages/cli pack --pack-destination /tmp/agentrepo-cli-package
```

## Publicación independiente

El CLI usa tags `cli-vX.Y.Z` y el workflow `Release CLI`. La versión del tag debe
coincidir con packages/cli/package.json. Este flujo prueba y empaqueta el CLI sin
desplegar la web ni los backends; los tags `vX.Y.Z` son releases de la plataforma.
