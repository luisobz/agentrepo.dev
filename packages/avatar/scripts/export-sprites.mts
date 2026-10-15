/**
 * Exports the avatar art to editable / shareable files:
 *   assets/sprites/avatar-sheet.png      (1 px per art pixel, rows = clips)
 *   assets/sprites/avatar-sheet@4x.png   (nearest-neighbour upscale)
 *   assets/sprites/avatar-sheet.json     (cell size, rows, frames, fps, loop…)
 *   assets/sprites/<clip>.svg            (static frame of each clip)
 *
 * Usage: pnpm sprites   (loads the TypeScript sources through Vite, no extra deps)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'src/sprite');
const out = resolve(root, 'assets/sprites');

async function loadModules() {
  if (process.env.SPRITES_DIRECT) {
    return {
      art: await import(`${src}/avatar-art.ts`),
      clips: await import(`${src}/avatar-clips.ts`),
      compose: await import(`${src}/compose.ts`),
    };
  }
  const { createServer } = await import('vite');
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  try {
    return {
      art: await server.ssrLoadModule(`${src}/avatar-art.ts`),
      clips: await server.ssrLoadModule(`${src}/avatar-clips.ts`),
      compose: await server.ssrLoadModule(`${src}/compose.ts`),
    };
  } finally {
    await server.close();
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf: Buffer) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function encodePng(width: number, height: number, rgba: Uint8ClampedArray) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    raw.set(
      rgba.subarray(y * width * 4, (y + 1) * width * 4),
      y * (width * 4 + 1) + 1,
    );
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function upscale(w: number, h: number, rgba: Uint8ClampedArray, k: number) {
  const outBuf = new Uint8ClampedArray(w * k * h * k * 4);
  for (let y = 0; y < h * k; y += 1)
    for (let x = 0; x < w * k; x += 1)
      outBuf.set(
        rgba.subarray(
          (((y / k) | 0) * w + ((x / k) | 0)) * 4,
          (((y / k) | 0) * w + ((x / k) | 0)) * 4 + 4,
        ),
        (y * w * k + x) * 4,
      );
  return outBuf;
}

const { art, clips, compose } = await loadModules();
const { SPRITE_SHEET, CLIPS } = clips;
const { GRID, PALETTE } = art;
const face = '#7a2230';
mkdirSync(out, { recursive: true });

const width = SPRITE_SHEET.columns * GRID;
const cellH = GRID + compose.CELL_HEADROOM;
const height = SPRITE_SHEET.rows.length * cellH;
const sheet = new Uint8ClampedArray(width * height * 4);
SPRITE_SHEET.rows.forEach((name: string, row: number) => {
  CLIPS[name].frames.forEach((pose: unknown, col: number) => {
    const cell: Uint8ClampedArray = compose.poseToRgba(pose, face);
    for (let y = 0; y < cellH; y += 1) {
      sheet.set(
        cell.subarray(y * GRID * 4, (y + 1) * GRID * 4),
        ((row * cellH + y) * width + col * GRID) * 4,
      );
    }
  });
  const pose = CLIPS[name].frames[CLIPS[name].staticFrame];
  const paths = compose
    .poseToPaths(pose)
    .map(
      (p: { key: string; d: string }) =>
        `<path fill="${p.key === 'E' ? face : PALETTE[p.key]}" d="${p.d}"/>`,
    )
    .join('');
  writeFileSync(
    resolve(out, `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -4 32 36" width="192" height="216" shape-rendering="crispEdges">${paths}</svg>\n`,
  );
});
writeFileSync(
  resolve(out, 'avatar-sheet.png'),
  encodePng(width, height, sheet),
);
writeFileSync(
  resolve(out, 'avatar-sheet@4x.png'),
  encodePng(width * 4, height * 4, upscale(width, height, sheet, 4)),
);
writeFileSync(
  resolve(out, 'avatar-sheet.json'),
  JSON.stringify(
    {
      cellWidth: GRID,
      cellHeight: GRID + compose.CELL_HEADROOM,
      originY: compose.CELL_HEADROOM,
      columns: SPRITE_SHEET.columns,
      rows: SPRITE_SHEET.rows.map((name: string) => ({
        name,
        frames: CLIPS[name].frames.length,
        fps: CLIPS[name].fps,
        loop: CLIPS[name].loop,
        staticFrame: CLIPS[name].staticFrame,
      })),
      note: 'Each cell has 4px of headroom (originY) so hops are not clipped. Empty cells are transparent.',
    },
    null,
    2,
  ) + '\n',
);
console.log(`Sprites exported to ${out}`);
