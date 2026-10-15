import {
  BODY,
  CHEEKS,
  EYES,
  FX,
  GRID,
  HEAD,
  MOUTHS,
  PALETTE,
  PROPS,
  SCREENS,
  SHADOW,
  type Patch,
  type PaletteKey,
} from './avatar-art';
import type { Pose } from './avatar-clips';

/** Pixels keyed by "x,y" → palette key; later writes win. */
type Canvas = Map<string, PaletteKey>;

function stamp(canvas: Canvas, patch: Patch, dx = 0, dy = 0) {
  patch.rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx += 1) {
      const ch = row[rx];
      if (ch === '.' || !(ch in PALETTE)) continue;
      canvas.set(`${patch.x + rx + dx},${patch.y + ry + dy}`, ch as PaletteKey);
    }
  });
}

/** Paints a pose into a pixel map (grid coordinates, may exceed 0–31 when hopping). */
export function paintPose(pose: Pose): Canvas {
  const canvas: Canvas = new Map();
  const bodyDy = pose.bodyDy ?? 0;
  const headDy = bodyDy + (pose.headDy ?? 0);
  const look = pose.lookX ?? 0;

  stamp(canvas, SHADOW);
  stamp(canvas, BODY, 0, bodyDy);
  stamp(canvas, HEAD, 0, headDy);
  if (pose.cheeks !== false) CHEEKS.forEach((c) => stamp(canvas, c, 0, headDy));
  EYES[pose.eyes].forEach((e) => stamp(canvas, e, look, headDy));
  stamp(canvas, MOUTHS[pose.mouth], look, headDy);
  PROPS.forEach((prop) => stamp(canvas, prop, 0, bodyDy));
  stamp(canvas, SCREENS[pose.screen ?? 'prompt'], 0, bodyDy);
  if (pose.fx) FX[pose.fx].forEach((f) => stamp(canvas, f));
  return canvas;
}

export interface ColorPath {
  key: PaletteKey;
  d: string;
}

const cache = new Map<string, ColorPath[]>();

/**
 * Converts a pose into one SVG path per color, merging horizontal runs so a
 * frame is ~20 DOM nodes instead of ~600 rects. Results are memoized.
 */
export function poseToPaths(pose: Pose): ColorPath[] {
  const id = JSON.stringify(pose);
  const hit = cache.get(id);
  if (hit) return hit;

  const canvas = paintPose(pose);
  const byColor = new Map<PaletteKey, string[]>();
  for (let y = -GRID; y < GRID * 2; y += 1) {
    let x = -GRID;
    while (x < GRID * 2) {
      const key = canvas.get(`${x},${y}`);
      if (!key) {
        x += 1;
        continue;
      }
      let end = x + 1;
      while (canvas.get(`${end},${y}`) === key) end += 1;
      const list = byColor.get(key) ?? [];
      list.push(`M${x} ${y}h${end - x}v1h${x - end}z`);
      byColor.set(key, list);
      x = end;
    }
  }
  const order = Object.keys(PALETTE) as PaletteKey[];
  const paths = order
    .filter((key) => byColor.has(key))
    .map((key) => ({ key, d: (byColor.get(key) ?? []).join('') }));
  cache.set(id, paths);
  return paths;
}

/** Headroom above the 32px grid so hops are never clipped in exported cells. */
export const CELL_HEADROOM = 4;

/** RGBA buffer (32 × 36) of a pose, for exporting sprite sheets (eyes use `face`). */
export function poseToRgba(pose: Pose, face = '#7a2230'): Uint8ClampedArray {
  const canvas = paintPose(pose);
  const h = GRID + CELL_HEADROOM;
  const out = new Uint8ClampedArray(GRID * h * 4);
  const parse = (color: string): [number, number, number, number] => {
    const rgba = color.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
    if (rgba) return [+rgba[1], +rgba[2], +rgba[3], Math.round(+rgba[4] * 255)];
    const hex = color.replace('#', '');
    return [0, 2, 4]
      .map((i) => parseInt(hex.slice(i, i + 2), 16))
      .concat(255) as [number, number, number, number];
  };
  canvas.forEach((key, pos) => {
    const [x, y] = pos.split(',').map(Number);
    const row = y + CELL_HEADROOM;
    if (x < 0 || row < 0 || x >= GRID || row >= h) return;
    const color = key === 'E' ? face : PALETTE[key];
    out.set(parse(color), (row * GRID + x) * 4);
  });
  return out;
}
