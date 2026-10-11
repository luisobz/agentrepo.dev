import { realpath } from 'node:fs/promises';
import { InstallerError } from './errors.mjs';
import { readJson } from './filesystem.mjs';
import { installSkills, verifyInstalledSkills } from './install.mjs';
import { manifestIntegrity, parseManifest } from './manifest.mjs';
import { fetchLatestVersion } from './registry.mjs';

export async function runCommand(options) {
  const root = await realpath(options.root);
  const original = await readJson(root, 'agent.json', true);
  const manifest = parseManifest(original ?? { schemaVersion: 1, skills: {} });
  const target = options.target ?? manifest.target ?? 'agents';
  const common = { root, target, fetchSkill: options.fetchSkill };
  if (options.command === 'verify') return verifyInstalledSkills(common);
  if (options.command === 'reset') {
    if (!options.hard)
      throw new InstallerError(
        'Utiliza agentrepo reset --hard para restaurar los snapshots fijados.',
      );
    return installSkills({ ...common, frozen: true });
  }
  if (options.command === 'install' && original && !options.target)
    return installSkills({ ...common, frozen: options.frozen });
  if (options.command !== 'install') {
    const match = options.command.match(
      /^([a-z0-9]+(?:-[a-z0-9]+)*)(?:@(latest|(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)))?$/,
    );
    if (!match || match[1].length > 120)
      throw new InstallerError('Utiliza agentrepo skill@latest o skill@1.0.0.');
    const [, slug, requested = 'latest'] = match;
    const version =
      requested === 'latest'
        ? await (
            options.fetchLatest ??
            ((name) => fetchLatestVersion(manifest.registry, name))
          )(slug)
        : requested;
    manifest.skills[slug] = version;
  }
  manifest.target = target;
  return installSkills({
    ...common,
    manifest,
    expectedManifest: original
      ? manifestIntegrity(parseManifest(original))
      : null,
    frozen: options.frozen,
  });
}
