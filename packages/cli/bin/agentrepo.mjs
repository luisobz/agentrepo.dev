#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { realpath, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { installSkills, verifyInstalledSkills } from '../src/install.mjs';
import { InstallerError } from '../src/errors.mjs';
import { chooseTarget } from '../src/prompt.mjs';
const HELP = `AgentRepo CLI 0.1.0

  agentrepo init                         Crea agent.json sin sobrescribirlo
  agentrepo install                      Instala snapshots de solo lectura
  agentrepo verify                       Verifica integridad y permisos
  agentrepo install --target claude       Selecciona una herramienta sin preguntar
  agentrepo install --frozen-lockfile     Exige un lockfile compatible

Opciones:
  --cwd <ruta>       Raíz del proyecto (directorio actual por defecto)
  --target <nombre>  agents, codex, claude, cursor o copilot
  --yes             Usa .agents/skills sin preguntar
  --help            Muestra esta ayuda
  --version         Muestra la versión del instalador

Sin terminal interactivo se utiliza .agents/skills. No se ejecutan scripts
ni instrucciones de las skills instaladas. Añade .agentrepo/ al .gitignore
y conserva agent.json y agent-lock.json en el control de versiones.
`;
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      cwd: { type: 'string' },
      target: { type: 'string' },
      yes: { type: 'boolean' },
      'frozen-lockfile': { type: 'boolean' },
      help: { type: 'boolean' },
      version: { type: 'boolean' },
    },
  });
  if (values.version) {
    console.log('0.1.0');
    return;
  }
  if (values.help || positionals.length === 0) {
    console.log(HELP);
    return;
  }
  if (positionals.length !== 1)
    throw new InstallerError('Utiliza init, install o verify. Consulta --help.');
  const command = positionals[0];
  const root = await realpath(values.cwd ?? process.cwd());
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
      'Creado agent.json. Declara skills como { "mi-skill": "1.0.0" } y ejecuta install.',
    );
    return;
  }
  if (!['install', 'verify'].includes(command))
    throw new InstallerError(
      'Comando desconocido. Utiliza init, install o verify.',
    );
  const target = values.target ?? (await chooseTarget({ yes: values.yes }));
  if (command === 'verify') {
    const result = await verifyInstalledSkills({ root, target });
    console.log(
      `Verificados ${result.verified.length} snapshots en ${result.directory}.`,
    );
    return;
  }
  const result = await installSkills({
    root,
    target,
    frozen: values['frozen-lockfile'],
  });
  console.log(
    `Instaladas ${result.installed.length} skills en ${result.directory}.`,
  );
  if (result.repaired.length)
    console.log(
      `Restaurados snapshots alterados: ${result.repaired.join(', ')}.`,
    );
  result.installed.forEach((slug) => console.log(`  ✓ ${slug}`));
}
try {
  await main();
} catch (error) {
  console.error(
    error instanceof InstallerError || error.code?.startsWith('ERR_PARSE_ARGS')
      ? error.message
      : 'No se pudo completar la operación. Comprueba el acceso al proyecto y al catálogo.',
  );
  process.exitCode = 1;
}
