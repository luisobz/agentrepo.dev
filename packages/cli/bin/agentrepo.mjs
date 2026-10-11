#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { realpath, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { InstallerError } from '../src/errors.mjs';
import { runCommand } from '../src/commands.mjs';
import { runInteractive } from '../src/interactive.mjs';
import { chooseTarget } from '../src/prompt.mjs';
import { readJson } from '../src/filesystem.mjs';
const HELP = `AgentRepo CLI 0.2.1

  agentrepo                Abre el asistente interactivo
  agentrepo skill2          Añade una skill y fija la versión resuelta
  agentrepo verify          Verifica snapshots e integridad
  agentrepo install         Instala las skills del proyecto
  agentrepo reset --hard    Restaura snapshots según el lock; no borra tu código

La herramienta se recuerda en agent.json. Fallback: .agents/skills.
Opciones avanzadas: --cwd <ruta>, --target <herramienta>, --frozen-lockfile,
--yes, --help y --version. Sin terminal interactivo, el comando sin argumentos
muestra esta ayuda. Añade .agentrepo/ a .gitignore y guarda agent.json y su lock.
`;
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      cwd: { type: 'string' },
      target: { type: 'string' },
      yes: { type: 'boolean' },
      hard: { type: 'boolean' },
      'frozen-lockfile': { type: 'boolean' },
      help: { type: 'boolean' },
      version: { type: 'boolean' },
    },
  });
  if (values.version) {
    console.log('0.2.1');
    return;
  }
  if (values.help) {
    console.log(HELP);
    return;
  }
  const root = await realpath(values.cwd ?? process.cwd());
  if (positionals.length === 0) {
    if (process.stdin.isTTY && process.stdout.isTTY && !values.yes)
      await runInteractive({ root });
    else console.log(HELP);
    return;
  }
  if (positionals.length !== 1)
    throw new InstallerError('Utiliza un único comando. Consulta --help.');
  const command = positionals[0];
  if (command === 'init') {
    try {
      await writeFile(
        join(root, 'agent.json'),
        JSON.stringify({ schemaVersion: 1, skills: {} }, null, 2) + '\n',
        { flag: 'wx' },
      );
    } catch (error) {
      if (error.code === 'EEXIST')
        throw new InstallerError('agent.json ya existe; no se ha sobrescrito.');
      throw error;
    }
    console.log(
      'Creado agent.json. Ejecuta agentrepo para configurar las skills.',
    );
    return;
  }
  let target = values.target;
  if (
    !target &&
    !['verify', 'reset'].includes(command) &&
    process.stdin.isTTY &&
    process.stdout.isTTY &&
    !values.yes
  ) {
    const manifest = await readJson(root, 'agent.json', true);
    if (!manifest?.target) target = await chooseTarget();
  }
  const result = await runCommand({
    root,
    command,
    target,
    frozen: values['frozen-lockfile'],
    hard: values.hard,
  });
  console.log(
    `✓ ${(result.installed ?? result.verified).length} skills en ${result.directory}.`,
  );
  if (result.repaired?.length)
    console.log(`Restaurados snapshots: ${result.repaired.join(', ')}.`);
}
try {
  await main();
} catch (error) {
  console.error(
    error instanceof InstallerError || error.code?.startsWith('ERR_PARSE_ARGS')
      ? error.message
      : 'No se pudo completar la operación. Comprueba el proyecto y el catálogo.',
  );
  process.exitCode = 1;
}
