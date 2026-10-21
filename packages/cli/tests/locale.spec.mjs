import { afterEach, expect, it, vi } from 'vitest';
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { removeProject } from './cleanup.mjs';
import { installSkills, verifyInstalledSkills } from '../src/install.mjs';
import { parseManifest, manifestIntegrity } from '../src/manifest.mjs';
import { fetchPublishedSkill } from '../src/registry.mjs';
const roots = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(roots.splice(0).map(removeProject));
});
async function project(locale) {
  const root = await mkdtemp(join(tmpdir(), 'agentrepo-locale-'));
  roots.push(root);
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({ schemaVersion: 1, locale, skills: { example: '0.1.0' } }),
  );
  return root;
}
const snapshot = (locale = 'es') => ({
  version: '0.1.0',
  content:
    locale === 'en' ? 'English instructions' : 'Instrucciones originales',
  contentLocale: locale,
  isLocked: false,
});
it('installs the requested language and locks its actual variant', async () => {
  const root = await project('en');
  const fetchSkill = vi.fn(async (_, __, locale) => snapshot(locale));
  await installSkills({ root, fetchSkill });
  expect(fetchSkill).toHaveBeenCalledWith('example', '0.1.0', 'en');
  expect(
    await readFile(join(root, '.agents/skills/example/SKILL.md'), 'utf8'),
  ).toContain('English instructions');
  const lock = JSON.parse(
    await readFile(join(root, 'agent-lock.json'), 'utf8'),
  );
  expect(lock.skills.example).toMatchObject({
    requestedLocale: 'en',
    contentLocale: 'en',
  });
  await verifyInstalledSkills({ root, fetchSkill });
});
it('pins a fallback so a newly available translation cannot silently replace it', async () => {
  const root = await project('en');
  const first = await installSkills({
    root,
    fetchSkill: async () => snapshot('es'),
  });
  expect(first.fallbacks).toEqual([
    { slug: 'example', requested: 'en', resolved: 'es' },
  ]);
  const fetchSkill = vi.fn(async (_, __, locale) => snapshot(locale));
  await installSkills({ root, frozen: true, fetchSkill });
  expect(fetchSkill).toHaveBeenCalledWith('example', '0.1.0', 'es');
  expect(
    await readFile(join(root, '.agents/skills/example/SKILL.md'), 'utf8'),
  ).toContain('Instrucciones originales');
  await expect(
    installSkills({
      root,
      fetchSkill: async () => ({
        ...snapshot('es'),
        content: 'Changed upstream',
      }),
    }),
  ).rejects.toThrow(/integrity/);
});
it('changing locale deliberately switches variants without changing the skill version', async () => {
  const root = await project('es');
  const fetchSkill = async (_, __, locale) => snapshot(locale);
  await installSkills({ root, fetchSkill });
  await writeFile(
    join(root, 'agent.json'),
    JSON.stringify({
      schemaVersion: 1,
      locale: 'en',
      skills: { example: '0.1.0' },
    }),
  );
  await expect(
    installSkills({ root, frozen: true, fetchSkill }),
  ).rejects.toThrow(/Frozen/);
  await installSkills({ root, fetchSkill });
  expect(
    await readFile(join(root, '.agents/skills/example/SKILL.md'), 'utf8'),
  ).toContain('English instructions');
});
it('preserves legacy manifest hashes and validates locale identifiers', () => {
  const legacy = parseManifest({ schemaVersion: 1, skills: {} });
  expect(legacy).not.toHaveProperty('locale');
  expect(manifestIntegrity(legacy)).toBe(
    manifestIntegrity({ ...legacy, locale: undefined }),
  );
  expect(
    parseManifest({ schemaVersion: 1, locale: 'en-gb', skills: {} }).locale,
  ).toBe('en-GB');
  expect(() =>
    parseManifest({ schemaVersion: 1, locale: '../en', skills: {} }),
  ).toThrow();
});
it('uses supported base languages and requests the original for other locales', async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify({ result: { data: { json: snapshot('es') } } }),
      ),
  );
  vi.stubGlobal('fetch', fetcher);
  await fetchPublishedSkill('https://example.com', 'example', '0.1.0', 'en-GB');
  expect(
    JSON.parse(fetcher.mock.calls[0][0].searchParams.get('input')).json.locale,
  ).toBe('en');
  await fetchPublishedSkill('https://example.com', 'example', '0.1.0', 'fr');
  expect(
    JSON.parse(fetcher.mock.calls[1][0].searchParams.get('input')).json,
  ).not.toHaveProperty('locale');
});

it('rejects a changed resolved language even when the bytes happen to match', async () => {
  const root = await project('en');
  await installSkills({ root, fetchSkill: async () => snapshot('es') });
  await expect(
    installSkills({
      root,
      fetchSkill: async () => ({ ...snapshot('es'), contentLocale: 'en' }),
    }),
  ).rejects.toThrow(/idioma fijado/);
});

it('interactive language changes persist without changing the selected tool or versions', async () => {
  const { runCommand } = await import('../src/commands.mjs');
  const root = await project('es');
  const fetchSkill = async (_, __, locale) => snapshot(locale);
  await runCommand({
    root,
    command: 'install',
    target: 'claude',
    locale: 'en',
    fetchSkill,
  });
  let manifest = JSON.parse(await readFile(join(root, 'agent.json'), 'utf8'));
  expect(manifest).toMatchObject({
    target: 'claude',
    locale: 'en',
    skills: { example: '0.1.0' },
  });
  await runCommand({ root, command: 'install', locale: 'source', fetchSkill });
  manifest = JSON.parse(await readFile(join(root, 'agent.json'), 'utf8'));
  expect(manifest).not.toHaveProperty('locale');
  expect(manifest.target).toBe('claude');
});

it('rejects lock language metadata inconsistent with an unchanged manifest', async () => {
  const root = await project('en');
  const fetchSkill = async () => snapshot('en');
  await installSkills({ root, fetchSkill });
  const file = join(root, 'agent-lock.json');
  const lock = JSON.parse(await readFile(file, 'utf8'));
  lock.skills.example.requestedLocale = 'es';
  await chmod(file, 0o644);
  await writeFile(file, JSON.stringify(lock));
  await expect(installSkills({ root, fetchSkill })).rejects.toThrow(/idioma/);
  await expect(verifyInstalledSkills({ root, fetchSkill })).rejects.toThrow(
    /no coincide/,
  );
});
