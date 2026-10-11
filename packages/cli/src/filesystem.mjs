import {
  lstat,
  chmod,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { InstallerError } from './errors.mjs';
export async function exists(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
export async function assertSafePath(root, path) {
  const resolved = resolve(path);
  const rel = relative(root, resolved);
  if (
    isAbsolute(rel) ||
    rel.startsWith(`..${sep}`) ||
    rel === '..' ||
    resolve(root, rel) !== resolved
  )
    throw new InstallerError('Destino fuera del proyecto.');
  let cursor = root;
  for (const part of rel.split(sep).filter(Boolean)) {
    cursor = join(cursor, part);
    const info = await exists(cursor);
    if (info?.isSymbolicLink())
      throw new InstallerError('No se instalan skills a través de un symlink.');
  }
}
export async function readJson(root, name, optional = false) {
  const path = join(root, name);
  await assertSafePath(root, path);
  try {
    const info = await exists(path);
    if (info && (!info.isFile() || info.size > 2 * 1024 * 1024))
      throw new InstallerError(`${name}: fichero inválido o demasiado grande.`);
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    if (error instanceof InstallerError) throw error;
    throw new InstallerError(
      `No se pudo leer ${name}: comprueba que contiene JSON válido.`,
      { cause: error },
    );
  }
}
/** Stage every file, then rename; roll back earlier writes if a later one fails. */
export async function commitFiles(root, changes) {
  const stage = join(root, '.agentrepo', `transaction-${randomUUID()}`);
  await mkdir(stage);
  const applied = [];
  let keepStage = false;
  try {
    for (let i = 0; i < changes.length; i++) {
      if (changes[i].content !== null) {
        const staged = join(stage, `new-${i}`);
        await writeFile(staged, changes[i].content, { flag: 'wx' });
        if (changes[i].immutable || changes[i].readOnly)
          await chmod(staged, 0o444);
      }
    }
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const destination = join(root, change.path);
      await assertSafePath(root, destination);
      const folder = dirname(destination);
      await mkdir(folder, { recursive: true });
      const folderMode = (await lstat(folder)).mode & 0o777;
      const item = {
        destination,
        folder,
        folderMode,
        immutable: change.immutable,
        backup: join(stage, `old-${i}`),
        backedUp: false,
        written: false,
      };
      applied.push(item);
      if (change.immutable) await chmod(folder, folderMode | 0o200);
      if (await exists(destination)) {
        await rename(destination, item.backup);
        item.backedUp = true;
      }
      if (change.content !== null) {
        await rename(join(stage, `new-${i}`), destination);
        item.written = true;
      }
      if (change.immutable) await chmod(folder, 0o555);
    }
  } catch (error) {
    try {
      for (const item of applied.reverse()) {
        if (item.immutable) await chmod(item.folder, item.folderMode | 0o200);
        if (item.written) await rm(item.destination, { force: true });
        if (item.backedUp) await rename(item.backup, item.destination);
        if (item.immutable) await chmod(item.folder, item.folderMode);
      }
    } catch (rollbackError) {
      keepStage = true;
      throw new InstallerError(
        `No se pudo completar la restauración. Conserva la copia de seguridad en ${stage}.`,
        { cause: rollbackError },
      );
    }
    throw new InstallerError(
      'La instalación falló; se restauraron los ficheros anteriores.',
      { cause: error },
    );
  } finally {
    if (!keepStage) await rm(stage, { recursive: true, force: true });
  }
}
