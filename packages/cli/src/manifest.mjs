import { createHash } from 'node:crypto';
import { InstallerError } from './errors.mjs';
export const DEFAULT_REGISTRY = 'https://agentrepo.dev/web/api/v1';
export const TARGETS = Object.freeze({
  agents: '.agents/skills',
  codex: '.agents/skills',
  claude: '.claude/skills',
  cursor: '.cursor/skills',
  copilot: '.github/skills',
});
export function integrity(content) {
  return 'sha256-' + createHash('sha256').update(content).digest('base64');
}
export function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function parseManifest(value) {
  if (!record(value) || value.schemaVersion !== 1 || !record(value.skills))
    throw new InstallerError(
      'agent.json debe declarar schemaVersion: 1 y un objeto skills.',
    );
  if (
    Object.keys(value).some(
      (key) =>
        !['schemaVersion', 'skills', 'registry', '$schema'].includes(key),
    )
  )
    throw new InstallerError('agent.json contiene propiedades desconocidas.');
  if (Object.keys(value.skills).length > 100)
    throw new InstallerError('Máximo 100 skills por proyecto.');
  const skills = {};
  for (const [slug, version] of Object.entries(value.skills).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new InstallerError(
        'Nombre de skill inválido: utiliza minúsculas, números y guiones.',
      );
    if (
      typeof version !== 'string' ||
      !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)
    )
      throw new InstallerError(
        `La skill ${slug} necesita una versión exacta, por ejemplo 1.0.0.`,
      );
    skills[slug] = version;
  }
  const registry = value.registry ?? DEFAULT_REGISTRY;
  let url;
  try {
    url = new URL(registry);
  } catch {
    throw new InstallerError('Registry inválido.');
  }
  if (
    typeof registry !== 'string' ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new InstallerError(
      'Registry debe ser una URL HTTPS sin credenciales, query ni fragmento.',
    );
  return {
    schemaVersion: 1,
    registry: url.toString().replace(/\/$/, ''),
    skills,
  };
}
export function manifestIntegrity(manifest) {
  return integrity(JSON.stringify(manifest));
}
export function targetDirectory(target = 'agents') {
  if (!Object.hasOwn(TARGETS, target))
    throw new InstallerError(
      `Herramienta desconocida. Opciones: ${Object.keys(TARGETS).join(', ')}.`,
    );
  return TARGETS[target];
}
export function renderSkill(slug, content) {
  // Keep existing Agent Skills metadata and tool extensions byte-for-byte.
  if (/^---\r?\n/.test(content)) {
    const header = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    if (
      !header ||
      !/^name:\s*\S/m.test(header) ||
      !/^description:\s*\S/m.test(header)
    )
      throw new InstallerError(
        `${slug}: SKILL.md necesita name y description en el frontmatter.`,
      );
    const name = header
      .match(/^name:\s*(.*?)\s*$/m)?.[1]
      ?.replace(/^(['"])(.*?)\1$/, '$2');
    if (name !== slug)
      throw new InstallerError(
        `${slug}: el name de SKILL.md debe coincidir con su slug.`,
      );
    return content;
  }
  const description =
    content
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*#+\s*/, '').trim())
      .find(Boolean)
      ?.slice(0, 500) || `Skill ${slug}`;
  return `---\nname: ${JSON.stringify(slug)}\ndescription: ${JSON.stringify(description)}\n---\n\n${content}`;
}
