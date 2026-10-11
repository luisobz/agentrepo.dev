import { createInterface } from 'node:readline/promises';
import { InstallerError } from './errors.mjs';
export const TOOL_CHOICES = [
  {
    id: 'agents',
    label: 'Genérica / otra herramienta',
    path: '.agents/skills',
  },
  { id: 'codex', label: 'Codex', path: '.agents/skills' },
  { id: 'claude', label: 'Claude Code', path: '.claude/skills' },
  { id: 'cursor', label: 'Cursor', path: '.cursor/skills' },
  { id: 'copilot', label: 'GitHub Copilot', path: '.github/skills' },
];
export async function chooseTarget({
  input = process.stdin,
  output = process.stdout,
  yes = false,
  ask,
} = {}) {
  if (!ask && (yes || !input.isTTY || !output.isTTY)) return 'agents';
  const prompt = ask ? null : createInterface({ input, output });
  const question = ask ?? ((text) => prompt.question(text));
  try {
    output.write('¿Qué herramienta utilizas en este proyecto?\n');
    TOOL_CHOICES.forEach((tool, index) =>
      output.write(`  ${index + 1}. ${tool.label} → ${tool.path}\n`),
    );
    for (let attempt = 0; attempt < 3; attempt++) {
      const answer = (await question('Elige una opción [1]: ')).trim();
      if (answer === '') return 'agents';
      const tool = TOOL_CHOICES.find(
        (choice, index) =>
          answer === String(index + 1) || answer.toLowerCase() === choice.id,
      );
      if (tool) return tool.id;
      output.write('Opción inválida.\n');
    }
    throw new InstallerError('No se eligió una herramienta válida.');
  } finally {
    prompt?.close();
  }
}
