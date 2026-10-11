import { createInterface } from 'node:readline/promises';
import { chooseTarget } from './prompt.mjs';
import { readJson } from './filesystem.mjs';
import { parseManifest } from './manifest.mjs';
import { runCommand } from './commands.mjs';

export async function runInteractive({
  root,
  input = process.stdin,
  output = process.stdout,
  execute = runCommand,
}) {
  const prompt = createInterface({ input, output });
  const ask = (text) => prompt.question(text);
  output.write('\nAgentRepo · Skills del proyecto\n');
  try {
    while (true) {
      const action =
        (
          await ask(
            '\n1. Instalar / restaurar\n2. Añadir skill\n3. Verificar\n4. Reset de snapshots\n5. Cambiar herramienta\n0. Salir\nElige [1]: ',
          )
        ).trim() || '1';
      if (action === '0') return;
      try {
        if (!['1', '2', '3', '4', '5'].includes(action)) {
          output.write('Opción inválida.\n');
          continue;
        }
        const stored = await readJson(root, 'agent.json', true);
        const manifest = stored ? parseManifest(stored) : null;
        let target = manifest?.target;
        if (!target || action === '5')
          target = await chooseTarget({ input, output, ask });
        let command = 'install';
        if (action === '2') {
          command = (
            await ask('Skill (nombre@latest o nombre@1.0.0): ')
          ).trim();
          if (!command) continue;
        }
        if (action === '3') command = 'verify';
        if (action === '4') {
          if (
            (
              await ask(
                'Restaurar snapshots fijados; no borra archivos del proyecto. ¿Continuar? [s/N]: ',
              )
            )
              .trim()
              .toLowerCase() !== 's'
          )
            continue;
          command = 'reset';
        }
        const result = await execute({
          root,
          command,
          target,
          hard: action === '4',
        });
        output.write(
          `✓ ${command}: ${(result.installed ?? result.verified).length} skills en ${result.directory}.\n`,
        );
      } catch (error) {
        output.write(`No se completó la operación: ${error.message}\n`);
      }
    }
  } finally {
    prompt.close();
  }
}
