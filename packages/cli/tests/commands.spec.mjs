import { afterEach, expect, it } from 'vitest';
import { mkdtemp, readFile, chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { removeProject } from './cleanup.mjs';
import { runCommand } from '../src/commands.mjs';
const roots = [];
afterEach(async () => Promise.all(roots.splice(0).map(removeProject)));
const fetchSkill = async (slug, version) => ({
  version,
  content: 'Reviewed instructions.',
  isLocked: false,
});
async function project() {
  const root = await mkdtemp(join(tmpdir(), 'agentrepo-commands-'));
  roots.push(root);
  return root;
}
it('resolves latest once, pins it and remembers the selected tool', async () => {
  const root = await project();
  await runCommand({
    root,
    command: 'example@latest',
    target: 'claude',
    fetchSkill,
    fetchLatest: async () => '2.1.0',
  });
  expect(
    JSON.parse(await readFile(join(root, 'agent.json'), 'utf8')),
  ).toMatchObject({ skills: { example: '2.1.0' }, target: 'claude' });
  await runCommand({ root, command: 'verify', fetchSkill });
  expect(
    await readFile(join(root, '.claude/skills/example/SKILL.md'), 'utf8'),
  ).toContain('Reviewed');
});
it('failed additions leave the old manifest and snapshots intact', async () => {
  const root = await project();
  await runCommand({ root, command: 'example@1.0.0', fetchSkill });
  const manifest = await readFile(join(root, 'agent.json'), 'utf8');
  await expect(
    runCommand({
      root,
      command: 'missing@latest',
      fetchSkill: async () => null,
      fetchLatest: async () => '1.0.0',
    }),
  ).rejects.toThrow();
  expect(await readFile(join(root, 'agent.json'), 'utf8')).toBe(manifest);
});
it('reset requires --hard and restores the locked snapshots without touching project files', async () => {
  const root = await project();
  await runCommand({ root, command: 'example@1.0.0', fetchSkill });
  const file = join(root, '.agents/skills/example/SKILL.md');
  await chmod(file, 0o644);
  await writeFile(file, 'poison');
  await writeFile(join(root, 'notes.txt'), 'project work');
  await expect(
    runCommand({ root, command: 'reset', fetchSkill }),
  ).rejects.toThrow(/hard/);
  await runCommand({ root, command: 'reset', hard: true, fetchSkill });
  expect(await readFile(file, 'utf8')).toContain('Reviewed');
  expect(await readFile(join(root, 'notes.txt'), 'utf8')).toBe('project work');
});
it('the interactive assistant installs into the chosen tool and exits cleanly', async () => {
  const { PassThrough, Writable } = await import('node:stream');
  const { runInteractive } = await import('../src/interactive.mjs');
  const root = await project();
  const input = new PassThrough();
  let stage = 0;
  const output = new Writable({
    write(chunk, encoding, done) {
      const text = chunk.toString();
      if (text.includes('Elige [1]') && stage === 0) {
        stage = 1;
        setImmediate(() => input.write('1\n'));
      } else if (text.includes('Elige una opción') && stage === 1) {
        stage = 2;
        setImmediate(() => input.write('3\n'));
      } else if (text.includes('Elige [1]') && stage === 2) {
        stage = 3;
        setImmediate(() => input.write('0\n'));
      }
      done();
    },
  });
  input.isTTY = output.isTTY = true;
  await runInteractive({ root, input, output });
  expect(
    JSON.parse(await readFile(join(root, 'agent.json'), 'utf8')).target,
  ).toBe('claude');
  expect(stage).toBe(3);
  input.destroy();
  output.destroy();
});
