import { readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { CLIPS } from './avatar-clips';
import { AVATAR_CHARACTERS } from '../characters';
it('keeps raster manifests and deployed sheets aligned with the shared clock', () => {
  for (const id of AVATAR_CHARACTERS.filter((id) => id !== 'repo')) {
    const here = dirname(fileURLToPath(import.meta.url));
    const base = resolve(here, '../../assets/characters', id);
    const metadata = JSON.parse(readFileSync(join(base, 'sheet.json'), 'utf8'));
    expect(metadata.cellWidth).toBe(32);
    expect(metadata.cellHeight).toBe(36);
    expect(metadata.rows).toEqual(
      Object.entries(CLIPS).map(([name, clip]) => ({
        name,
        frames: clip.frames.length,
        fps: clip.fps,
        loop: clip.loop,
        staticFrame: clip.staticFrame,
      })),
    );
    expect(readFileSync(join(base, 'sheet.png'))).toEqual(
      readFileSync(
        resolve(here, '../../../../apps/web/public/avatars', `${id}.png`),
      ),
    );
  }
});
