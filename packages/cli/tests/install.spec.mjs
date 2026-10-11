import { removeProject } from './cleanup.mjs';
import { afterEach, expect, it } from 'vitest';
import {
  chmod,
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installSkills } from '../src/install.mjs';
const roots = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => removeProject(root)));
});
async function project(skills = { example: '1.2.3' }) {
  const root = await mkdtemp(join(tmpdir(), 'agentrepo-cli-test-'));
  roots.push(root);
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, skills }),
  );
  return root;
}
const fetchSkill = async (slug, version) => ({
  version,
  content: '# Review changes\n\nReview changes before committing.',
  isLocked: false,
});
it('installs pinned snapshots into the selected tool and writes a reproducible lock', async () => {
  const root = await project();
  await installSkills({ root, target: 'claude', fetchSkill });
  const installed = await readFile(
    join(root, '.claude/skills/example/SKILL.md'),
    'utf8',
  );
  expect(installed).toContain('name: "example"');
  expect(installed).toContain('Review changes before committing.');
  const lock = JSON.parse(
    await readFile(join(root, 'agent-lock.json'), 'utf8'),
  );
  expect(lock.skills.example.version).toBe('1.2.3');
  expect(lock.skills.example.integrity).toMatch(/^sha256-/);
  await installSkills({ root, target: 'claude', fetchSkill, frozen: true });
  expect(
    await readFile(join(root, '.claude/skills/example/SKILL.md'), 'utf8'),
  ).toBe(installed);
});
it('defaults to .agents and repairs deliberately altered managed snapshots', async () => {
  const root = await project();
  await installSkills({ root, fetchSkill });
  const file = join(root, '.agents/skills/example/SKILL.md');
  await chmod(file, 0o644);
  await writeFile(file, 'local changes');
  const result = await installSkills({ root, fetchSkill });
  expect(result.repaired).toContain('example');
  expect(await readFile(file, 'utf8')).toContain(
    'Review changes before committing.',
  );
});
it('validates every download before writing any skill', async () => {
  const root = await project({ first: '1.0.0', second: '2.0.0' });
  await expect(
    installSkills({
      root,
      fetchSkill: async (slug, version) =>
        slug === 'second'
          ? { version, content: '', isLocked: true }
          : fetchSkill(slug, version),
    }),
  ).rejects.toThrow(/locked|premium/i);
  await expect(
    readFile(join(root, '.agents/skills/first/SKILL.md')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
});
it('rejects manifest traversal and floating versions', async () => {
  for (const skills of [
    { '../outside': '1.0.0' },
    { example: 'latest' },
    { example: '^1.0.0' },
  ]) {
    const root = await project(skills);
    await expect(installSkills({ root, fetchSkill })).rejects.toThrow();
  }
});
it('rejects symlink destinations without touching their targets', async () => {
  const root = await project();
  const outside = await project({});
  await symlink(outside, join(root, '.agents'), 'dir');
  await expect(installSkills({ root, fetchSkill })).rejects.toThrow(/symlink/i);
  await expect(
    readFile(join(outside, 'skills/example/SKILL.md')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
});
it('rejects changed immutable content and frozen manifest drift', async () => {
  const root = await project();
  await installSkills({ root, fetchSkill });
  await expect(
    installSkills({
      root,
      fetchSkill: async (slug, version) => ({
        version,
        content: 'changed upstream',
        isLocked: false,
      }),
    }),
  ).rejects.toThrow(/integrity/i);
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, skills: { example: '1.2.4' } }),
  );
  await expect(
    installSkills({ root, fetchSkill, frozen: true }),
  ).rejects.toThrow(/lock/i);
});
it('never overwrites an unowned skill directory', async () => {
  const root = await project();
  await mkdir(join(root, '.agents/skills/example'), { recursive: true });
  await writeFile(join(root, '.agents/skills/example/notes.txt'), 'mine');
  await expect(installSkills({ root, fetchSkill })).rejects.toThrow(
    /gestionada|owned/i,
  );
  expect(
    await readFile(join(root, '.agents/skills/example/notes.txt'), 'utf8'),
  ).toBe('mine');
});
