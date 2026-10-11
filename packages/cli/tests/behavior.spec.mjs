import { removeProject } from './cleanup.mjs';
import { afterEach, expect, it } from 'vitest';
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  rm,
  chmod,
} from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { installSkills, verifyInstalledSkills } from '../src/install.mjs';
import { commitFiles } from '../src/filesystem.mjs';
import { renderSkill, TARGETS } from '../src/manifest.mjs';
import { chooseTarget } from '../src/prompt.mjs';
const execute = promisify(execFile);
const roots = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => removeProject(root)));
});
async function project() {
  const root = await mkdtemp(join(tmpdir(), 'agentrepo-cli-behavior-'));
  roots.push(root);
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, skills: { example: '1.0.0' } }),
  );
  return root;
}
const fetchSkill = async (slug, version) => ({
  version,
  content: 'Review all changes.',
  isLocked: false,
});
it.each(Object.keys(TARGETS))(
  'uses the documented project directory for %s',
  async (target) => {
    const root = await project();
    await installSkills({ root, target, fetchSkill });
    expect(
      await readFile(join(root, TARGETS[target], 'example/SKILL.md'), 'utf8'),
    ).toContain('Review all changes.');
  },
);
it('Codex and generic installations share ownership', async () => {
  const root = await project();
  await installSkills({ root, target: 'codex', fetchSkill });
  await installSkills({ root, target: 'agents', fetchSkill });
});
it('prunes managed skills and permits reinstalling them later', async () => {
  const root = await project();
  await installSkills({ root, fetchSkill });
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, skills: {} }),
  );
  await installSkills({ root, fetchSkill });
  await expect(
    readFile(join(root, '.agents/skills/example/SKILL.md')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, skills: { example: '1.0.0' } }),
  );
  await installSkills({ root, fetchSkill });
  expect(
    await readFile(join(root, '.agents/skills/example/SKILL.md'), 'utf8'),
  ).toContain('Review all changes.');
});
it('rejects foreign files added after deliberately unlocking a snapshot', async () => {
  const root = await project();
  await installSkills({ root, fetchSkill });
  await chmod(join(root, '.agents/skills/example'), 0o755);
  await writeFile(join(root, '.agents/skills/example/notes.txt'), 'keep me');
  await expect(installSkills({ root, fetchSkill })).rejects.toThrow(/ajenos/);
  expect(
    await readFile(join(root, '.agents/skills/example/notes.txt'), 'utf8'),
  ).toBe('keep me');
});
it('preserves an existing skill manifest including tool-specific frontmatter', () => {
  const content =
    '---\nname: example\ndescription: Review code\nallowed-tools: Read\n---\n\nInstructions.';
  expect(renderSkill('example', content)).toBe(content);
  expect(() => renderSkill('different', content)).toThrow(/name/);
});
it('rolls back prior replacements when a later filesystem write fails', async () => {
  const root = await project();
  await mkdir(join(root, '.agentrepo'));
  await writeFile(join(root, 'existing'), 'original');
  await writeFile(join(root, 'not-a-directory'), 'blocked');
  await expect(
    commitFiles(root, [
      { path: 'existing', content: 'new' },
      { path: 'not-a-directory/child', content: 'cannot write' },
    ]),
  ).rejects.toThrow(/restauraron/);
  expect(await readFile(join(root, 'existing'), 'utf8')).toBe('original');
});
it('rejects concurrent installs and corrupted state', async () => {
  const root = await project();
  await mkdir(join(root, '.agentrepo'));
  await writeFile(join(root, '.agentrepo/install.lock'), 'existing');
  await expect(installSkills({ root, fetchSkill })).rejects.toThrow(/curso/);
  await rm(join(root, '.agentrepo/install.lock'));
  await writeFile(
    join(root, '.agentrepo/state.json'),
    JSON.stringify({
      schemaVersion: 1,
      targets: { agents: { '../outside': 'bad' } },
    }),
  );
  await expect(installSkills({ root, fetchSkill })).rejects.toThrow(/inválido/);
});
it('falls back without prompting in noninteractive terminals', async () => {
  expect(
    await chooseTarget({ input: { isTTY: false }, output: { isTTY: false } }),
  ).toBe('agents');
});
it('the packaged binary supports init, install and frozen installs in a fresh project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentrepo-cli-command-'));
  roots.push(root);
  const binary = join(process.cwd(), 'packages/cli/bin/agentrepo.mjs');
  await execute(process.execPath, [binary, 'init'], { cwd: root });
  const contents = await readFile(join(root, 'agent.json'), 'utf8');
  await expect(
    execute(process.execPath, [binary, 'init'], { cwd: root }),
  ).rejects.toMatchObject({ code: 1 });
  expect(await readFile(join(root, 'agent.json'), 'utf8')).toBe(contents);
  await execute(process.execPath, [binary, 'install', '--yes'], { cwd: root });
  const lock = await readFile(join(root, 'agent-lock.json'), 'utf8');
  await execute(
    process.execPath,
    [binary, 'install', '--frozen-lockfile', '--target', 'claude'],
    { cwd: root },
  );
  expect(await readFile(join(root, 'agent-lock.json'), 'utf8')).toBe(lock);
});
it('installs read-only snapshots and repairs managed content after deliberate permission changes', async () => {
  const { stat, chmod } = await import('node:fs/promises');
  const root = await project();
  await installSkills({ root, fetchSkill });
  const file = join(root, '.agents/skills/example/SKILL.md');
  const folder = join(root, '.agents/skills/example');
  expect((await stat(file)).mode & 0o222).toBe(0);
  expect((await stat(folder)).mode & 0o222).toBe(0);
  await chmod(folder, 0o755);
  await chmod(file, 0o644);
  await writeFile(file, 'altered snapshot');
  const result = await installSkills({ root, fetchSkill });
  expect(result.repaired).toContain('example');
  expect(await readFile(file, 'utf8')).toContain('Review all changes.');
  expect((await stat(file)).mode & 0o222).toBe(0);
});

it('verify detects tampering and permission changes; reinstall repairs the snapshot', async () => {
  const root = await project();
  await installSkills({ root, fetchSkill });
  await verifyInstalledSkills({ root, fetchSkill });
  const file = join(root, '.agents/skills/example/SKILL.md');
  await chmod(file, 0o644);
  await expect(verifyInstalledSkills({ root, fetchSkill })).rejects.toThrow(
    /permisos/,
  );
  await writeFile(file, 'poisoned content');
  await expect(verifyInstalledSkills({ root, fetchSkill })).rejects.toThrow(
    /alterado/,
  );
  await installSkills({ root, fetchSkill });
  await verifyInstalledSkills({ root, fetchSkill });
});

it('ordinary writes and additions to a snapshot are denied by the filesystem', async () => {
  if (process.platform === 'win32' || process.getuid?.() === 0) return;
  const root = await project();
  await installSkills({ root, fetchSkill });
  await expect(
    writeFile(join(root, '.agents/skills/example/SKILL.md'), 'poison'),
  ).rejects.toMatchObject({ code: 'EACCES' });
  await expect(
    writeFile(join(root, '.agents/skills/example/extra.md'), 'poison'),
  ).rejects.toMatchObject({ code: 'EACCES' });
});
it('upgrades a read-only snapshot only through a new pinned version', async () => {
  const root = await project();
  await installSkills({ root, fetchSkill });
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, skills: { example: '2.0.0' } }),
  );
  const next = async () => ({
    version: '2.0.0',
    content: 'New reviewed snapshot.',
    isLocked: false,
  });
  await installSkills({ root, fetchSkill: next });
  await verifyInstalledSkills({ root, fetchSkill: next });
  expect(
    await readFile(join(root, '.agents/skills/example/SKILL.md'), 'utf8'),
  ).toContain('New reviewed snapshot.');
});
it('interactive selection accepts a tool and Enter uses the portable fallback', async () => {
  const { PassThrough, Writable } = await import('node:stream');
  for (const [answer, expected] of [
    ['3', 'claude'],
    ['', 'agents'],
  ]) {
    const input = new PassThrough();
    let sent = false;
    const output = new Writable({
      write(chunk, encoding, callback) {
        if (!sent && chunk.toString().includes('Elige una opción')) {
          sent = true;
          setImmediate(() => input.write(answer + '\n'));
        }
        callback();
      },
    });
    input.isTTY = output.isTTY = true;
    expect(await chooseTarget({ input, output })).toBe(expected);
    input.destroy();
    output.destroy();
  }
});
