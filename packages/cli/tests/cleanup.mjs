import { chmod, lstat, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
export async function removeProject(root) {
  async function unlock(path) {
    const info = await lstat(path);
    if (info.isSymbolicLink()) return;
    await chmod(path, info.isDirectory() ? 0o755 : 0o644);
    if (info.isDirectory())
      for (const name of await readdir(path)) await unlock(join(path, name));
  }
  await unlock(root);
  await rm(root, { recursive: true, force: true });
}
