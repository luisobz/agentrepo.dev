# AgentRepo CLI

Instalador de skills por proyecto, con versiones exactas declaradas en `agent.json`.
Requiere Node.js 24 o posterior y pnpm. Instala skills publicadas del catálogo;
las guías de proyectos de agentes no son instaladores de sus runtimes.
Nunca ejecuta el contenido descargado.

## Uso

El paquete se distribuye como `agentrepo-cli-0.1.0.tgz` en las releases de GitHub,
acompañado de `SHA256SUMS`. No requiere dependencias en tiempo de ejecución.
Después de descargar y comprobar el checksum del paquete:

```sh
pnpm --package=/ruta/agentrepo-cli-0.1.0.tgz dlx agentrepo init
pnpm --package=/ruta/agentrepo-cli-0.1.0.tgz dlx agentrepo install
pnpm --package=/ruta/agentrepo-cli-0.1.0.tgz dlx agentrepo verify
```

`init` crea un manifiesto vacío sin sobrescribir uno existente. Añade las skills
publicadas que necesites y sus versiones exactas:

```json
{
  "schemaVersion": 1,
  "skills": {
    "code-review": "1.0.0"
  }
}
```

`code-review` es un ejemplo de formato, no una promesa de disponibilidad en el
catálogo. No se admiten `latest`, rangos o resolución automática de versiones.
El registry predeterminado es `https://agentrepo.dev/web/api/v1`; un registry
alternativo debe ser HTTPS, sin credenciales, query ni fragmento.

Durante `install` y `verify` se pregunta la herramienta en terminales interactivas.
Enter, `--yes` o una terminal no interactiva seleccionan `.agents/skills`.
También puedes elegir explícitamente `--target`:

| Target              | Carpeta del proyecto |
| ------------------- | -------------------- |
| `agents` (fallback) | `.agents/skills`     |
| `codex`             | `.agents/skills`     |
| `claude`            | `.claude/skills`     |
| `cursor`            | `.cursor/skills`     |
| `copilot`           | `.github/skills`     |

Rutas basadas en documentación oficial de [Codex](https://developers.openai.com/blog/skills-agents-sdk),
[Claude Code](https://code.claude.com/docs/en/skills), [Cursor](https://cursor.com/docs/skills)
y [GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills).
La ejecución del paquete usa [pnpm dlx](https://pnpm.io/10.x/cli/dlx).
Puedes repetir la instalación para otras herramientas; Codex y el fallback
comparten destino y propiedad. `--cwd /ruta/proyecto` cambia el proyecto.

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
