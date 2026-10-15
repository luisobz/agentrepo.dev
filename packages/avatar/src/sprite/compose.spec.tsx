import { describe, expect, it } from 'vitest';
import { GRID, HEAD, BODY, PALETTE } from './avatar-art';
import { CLIPS, SPRITE_SHEET, clipDurationMs } from './avatar-clips';
import { CELL_HEADROOM, paintPose, poseToPaths, poseToRgba } from './compose';

describe('pixel art', () => {
  it('head and body rows are exactly one grid wide', () => {
    for (const row of [...HEAD.rows, ...BODY.rows])
      expect(row.length).toBe(GRID);
  });

  it('every frame stays on the grid horizontally and within the headroom vertically', () => {
    for (const clip of Object.values(CLIPS)) {
      for (const pose of clip.frames) {
        for (const key of paintPose(pose).keys()) {
          const [x, y] = key.split(',').map(Number);
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThan(GRID);
          expect(y).toBeGreaterThanOrEqual(-CELL_HEADROOM);
          expect(y).toBeLessThan(GRID);
        }
      }
    }
  });

  it('uses only palette colors and one path per color', () => {
    for (const clip of Object.values(CLIPS)) {
      for (const pose of clip.frames) {
        const paths = poseToPaths(pose);
        const keys = paths.map((p) => p.key);
        expect(new Set(keys).size).toBe(keys.length);
        for (const k of keys) expect(PALETTE).toHaveProperty(k);
      }
    }
  });

  it('memoizes paths per pose', () => {
    const pose = CLIPS.idle.frames[0];
    expect(poseToPaths({ ...pose })).toBe(poseToPaths({ ...pose }));
  });

  it('expressions are visually distinct', () => {
    const idle = JSON.stringify(poseToPaths(CLIPS.idle.frames[0]));
    for (const name of ['happy', 'thinking', 'surprised'] as const) {
      const clip = CLIPS[name];
      expect(
        JSON.stringify(poseToPaths(clip.frames[clip.staticFrame])),
      ).not.toBe(idle);
    }
  });

  it('clip metadata is consistent', () => {
    for (const clip of Object.values(CLIPS)) {
      expect(clip.frames.length).toBeGreaterThan(0);
      expect(clip.staticFrame).toBeLessThan(clip.frames.length);
      expect(clip.fps).toBeGreaterThan(0);
      expect(clip.fps).toBeLessThanOrEqual(15);
      expect(clipDurationMs(clip)).toBeGreaterThan(0);
    }
    expect(SPRITE_SHEET.columns).toBe(
      Math.max(...Object.values(CLIPS).map((c) => c.frames.length)),
    );
  });

  it('exports opaque RGBA cells with headroom', () => {
    const rgba = poseToRgba(CLIPS.happy.frames[2]);
    expect(rgba.length).toBe(GRID * (GRID + CELL_HEADROOM) * 4);
    // The hop is drawn inside the headroom instead of being clipped.
    const firstRowAlpha = Array.from(
      { length: GRID },
      (_, x) => rgba[(1 * GRID + x) * 4 + 3],
    );
    expect(firstRowAlpha.some((a) => a > 0)).toBe(true);
  });
});
