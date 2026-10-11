import { mkdir, open, readFile, readdir, realpath, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { InstallerError } from './errors.mjs';
import {
  assertSafePath,
  commitFiles,
  exists,
  readJson,
} from './filesystem.mjs';
import {
  integrity,
  manifestIntegrity,
  parseManifest,
  record,
  renderSkill,
  targetDirectory,
  TARGETS,
} from './manifest.mjs';
import { fetchPublishedSkill } from './registry.mjs';
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const validSlug = (slug) =>
  slug.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
const validHash = (value) =>
  typeof value === 'string' && /^sha256-[A-Za-z0-9+/]{43}=$/.test(value);
function validateState(state) {
  if (!record(state) || state.schemaVersion !== 1 || !record(state.targets))
    throw new InstallerError('Estado local inválido: .agentrepo/state.json.');
  for (const [target, skills] of Object.entries(state.targets)) {
    if (
      !Object.hasOwn(TARGETS, target) ||
      !record(skills) ||
      Object.entries(skills).some(
        ([slug, hash]) => !validSlug(slug) || !validHash(hash),
      )
    )
      throw new InstallerError('Estado local inválido.');
  }
  return state;
}
function validateLock(lock) {
  if (!lock) return null;
  if (
    !record(lock) ||
    lock.schemaVersion !== 1 ||
    !validHash(lock.manifestIntegrity) ||
    !record(lock.skills)
  )
    throw new InstallerError('agent-lock.json inválido.');
  for (const [slug, entry] of Object.entries(lock.skills)) {
    if (
      !validSlug(slug) ||
      !record(entry) ||
      typeof entry.version !== 'string' ||
      !validHash(entry.integrity) ||
      !validHash(entry.sourceIntegrity)
    )
      throw new InstallerError('agent-lock.json inválido.');
  }
  return lock;
}
async function prepareSkills(manifest, lock, fetchSkill) {
  const prepared = {};
  for (const [slug, version] of Object.entries(manifest.skills)) {
    const snapshot = await fetchSkill(slug, version);
    if (snapshot?.isLocked === true)
      throw new InstallerError(
        `${slug}: contenido premium bloqueado; no se puede instalar públicamente.`,
      );
    if (
      !record(snapshot) ||
      snapshot.version !== version ||
      snapshot.isLocked !== false ||
      typeof snapshot.content !== 'string' ||
      !snapshot.content.trim() ||
      Buffer.byteLength(snapshot.content) > 4 * 1024 * 1024
    )
      throw new InstallerError(
        `${slug}@${version}: snapshot inválido o versión incorrecta.`,
      );
    const content = renderSkill(slug, snapshot.content);
    const entry = {
      version,
      sourceIntegrity: integrity(snapshot.content),
      integrity: integrity(content),
    };
    const previous = lock?.skills[slug];
    if (
      previous?.version === version &&
      (previous.integrity !== entry.integrity ||
        previous.sourceIntegrity !== entry.sourceIntegrity)
    )
      throw new InstallerError(
        `${slug}@${version}: integrity no coincide con agent-lock.json.`,
      );
    prepared[slug] = { entry, content };
  }
  return prepared;
}
async function planSkillFiles(root, directory, previous, prepared) {
  const changes = [];
  const repaired = [];
  for (const slug of new Set([
    ...Object.keys(previous),
    ...Object.keys(prepared),
  ])) {
    const folder = join(root, directory, slug);
    const file = join(folder, 'SKILL.md');
    await assertSafePath(root, file);
    const folderInfo = await exists(folder);
    const info = await exists(file);
    if (folderInfo && !folderInfo.isDirectory())
      throw new InstallerError(`${slug}: destino no es una carpeta.`);
    if (
      folderInfo &&
      !Object.hasOwn(previous, slug) &&
      (await readdir(folder)).length > 0
    )
      throw new InstallerError(
        `${slug}: carpeta no gestionada; no se sobrescribe contenido sin propiedad registrada.`,
      );
    if (
      folderInfo &&
      Object.hasOwn(previous, slug) &&
      (await readdir(folder)).some((name) => name !== 'SKILL.md')
    )
      throw new InstallerError(
        `${slug}: snapshot contiene archivos ajenos. Muévelos fuera de la carpeta para restaurar la versión fija.`,
      );
    if (info) {
      if (!info.isFile() || info.size > 8 * 1024 * 1024)
        throw new InstallerError(`${slug}: fichero instalado inválido.`);
      if (integrity(await readFile(file)) !== previous[slug])
        repaired.push(slug);
    }
    if (prepared[slug])
      changes.push({
        path: `${directory}/${slug}/SKILL.md`,
        content: prepared[slug].content,
        immutable: true,
      });
    else if (info)
      changes.push({
        path: `${directory}/${slug}/SKILL.md`,
        content: null,
        immutable: true,
      });
  }
  return { changes, repaired };
}
async function installLocked(options, root) {
  const original = await readJson(
    root,
    'agent.json',
    Boolean(options.manifest),
  );
  const originalHash = original
    ? manifestIntegrity(parseManifest(original))
    : null;
  if (
    options.expectedManifest !== undefined &&
    options.expectedManifest !== originalHash
  )
    throw new InstallerError('agent.json cambió durante la operación.');
  const manifest = parseManifest(options.manifest ?? original);
  const lock = validateLock(await readJson(root, 'agent-lock.json', true));
  const manifestHash = manifestIntegrity(manifest);
  if (
    options.frozen &&
    (!lock ||
      lock.manifestIntegrity !== manifestHash ||
      JSON.stringify(
        Object.fromEntries(
          Object.entries(lock.skills).map(([slug, entry]) => [
            slug,
            entry.version,
          ]),
        ),
      ) !== JSON.stringify(manifest.skills))
  )
    throw new InstallerError(
      'Frozen lockfile: agent-lock.json falta o no coincide con agent.json.',
    );
  const state = validateState(
    (await readJson(root, '.agentrepo/state.json', true)) ?? {
      schemaVersion: 1,
      targets: {},
    },
  );
  const target = options.target ?? manifest.target ?? 'agents';
  const directory = targetDirectory(target);
  // Codex and the portable fallback share one physical destination and ownership.
  const stateTarget = target === 'codex' ? 'agents' : target;
  const fetchSkill =
    options.fetchSkill ??
    ((slug, version) => fetchPublishedSkill(manifest.registry, slug, version));
  const prepared = await prepareSkills(manifest, lock, fetchSkill);
  const { changes, repaired } = await planSkillFiles(
    root,
    directory,
    state.targets[stateTarget] ?? {},
    prepared,
  );
  if (
    JSON.stringify(
      await readJson(root, 'agent.json', Boolean(options.manifest)),
    ) !== JSON.stringify(original)
  )
    throw new InstallerError(
      'agent.json cambió durante la instalación; vuelve a intentarlo.',
    );
  if (options.manifest)
    changes.push({ path: 'agent.json', content: json(manifest) });
  const nextLock = {
    schemaVersion: 1,
    registry: manifest.registry,
    manifestIntegrity: manifestHash,
    skills: Object.fromEntries(
      Object.entries(prepared).map(([slug, item]) => [slug, item.entry]),
    ),
  };
  if (!options.frozen)
    changes.push({
      path: 'agent-lock.json',
      content: json(nextLock),
      readOnly: true,
    });
  state.targets[stateTarget] = Object.fromEntries(
    Object.entries(prepared).map(([slug, item]) => [
      slug,
      item.entry.integrity,
    ]),
  );
  changes.push({
    path: '.agentrepo/state.json',
    content: json(state),
    readOnly: true,
  });
  await commitFiles(root, changes);
  return { target, directory, installed: Object.keys(prepared), repaired };
}
export async function installSkills(options) {
  const root = await realpath(options.root);
  targetDirectory(options.target);
  await assertSafePath(root, join(root, '.agentrepo/install.lock'));
  await mkdir(join(root, '.agentrepo'), { recursive: true });
  let guard;
  try {
    guard = await open(join(root, '.agentrepo/install.lock'), 'wx');
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new InstallerError(
        'Ya hay una instalación en curso. Si terminó inesperadamente, revisa .agentrepo/install.lock.',
      );
    throw error;
  }
  try {
    return await installLocked(options, root);
  } finally {
    await guard.close();
    await rm(join(root, '.agentrepo/install.lock'), { force: true });
  }
}

/** Read-only verification against the pinned public snapshot and local lock. */
export async function verifyInstalledSkills(options) {
  const root = await realpath(options.root);
  const manifest = parseManifest(await readJson(root, 'agent.json'));
  const directory = targetDirectory(options.target ?? manifest.target);
  const lock = validateLock(await readJson(root, 'agent-lock.json', true));
  if (
    !lock ||
    lock.manifestIntegrity !== manifestIntegrity(manifest) ||
    Object.keys(lock.skills).length !== Object.keys(manifest.skills).length ||
    Object.entries(manifest.skills).some(
      ([slug, version]) => lock.skills[slug]?.version !== version,
    )
  )
    throw new InstallerError('agent-lock.json no coincide con agent.json.');
  const prepared = await prepareSkills(
    manifest,
    lock,
    options.fetchSkill ??
      ((slug, version) =>
        fetchPublishedSkill(manifest.registry, slug, version)),
  );
  for (const [slug, item] of Object.entries(prepared)) {
    const folder = join(root, directory, slug);
    const file = join(folder, 'SKILL.md');
    await assertSafePath(root, file);
    const info = await exists(file);
    const folderInfo = await exists(folder);
    if (
      !info?.isFile() ||
      info.size > 8 * 1024 * 1024 ||
      integrity(await readFile(file)) !== item.entry.integrity ||
      (await readdir(folder)).some((name) => name !== 'SKILL.md')
    )
      throw new InstallerError(
        `${slug}: snapshot alterado o ausente. Ejecuta install para restaurarlo.`,
      );
    if (
      process.platform !== 'win32' &&
      (info.mode & 0o222 || folderInfo.mode & 0o222)
    )
      throw new InstallerError(
        `${slug}: permisos de escritura habilitados. Ejecuta install para restaurar solo lectura.`,
      );
  }
  return { directory, verified: Object.keys(prepared) };
}
