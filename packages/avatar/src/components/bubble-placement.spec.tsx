import { describe, expect, it } from 'vitest';
import { BUBBLE_GAP, VIEWPORT_PADDING, placeBubble } from './bubble-placement';

const base = {
  cx: 200,
  cy: 200,
  half: 24,
  bw: 160,
  bh: 40,
  vw: 800,
  vh: 600,
  placement: 'auto' as const,
};

describe('placeBubble', () => {
  it('defaults below the avatar', () => {
    const p = placeBubble(base);
    expect(p.side).toBe('bottom');
    expect(p.y).toBe(200 + 24 + BUBBLE_GAP);
    expect(p.x).toBe(200 - 80);
  });

  it('flips above when there is no room below', () => {
    const p = placeBubble({ ...base, cy: 580 });
    expect(p.side).toBe('top');
    expect(p.y + 40).toBeLessThanOrEqual(580 - 24);
  });

  it('honors the requested side when it fits', () => {
    expect(placeBubble({ ...base, placement: 'right' }).side).toBe('right');
    expect(placeBubble({ ...base, placement: 'top' }).side).toBe('top');
  });

  it('clamps along the edge axis instead of rejecting the side (avatar in a corner)', () => {
    const p = placeBubble({ ...base, cx: 780, cy: 30 });
    expect(p.side).toBe('bottom');
    expect(p.x + 160).toBeLessThanOrEqual(800 - VIEWPORT_PADDING);
    // The tail still points at the avatar.
    expect(p.x + p.tail).toBeGreaterThan(700);
  });

  it('avoids covering an interactive control', () => {
    const control = { left: 100, top: 230, right: 300, bottom: 280 };
    const p = placeBubble({ ...base, obstacles: [control] });
    expect(p.side).not.toBe('bottom');
    const box = { left: p.x, top: p.y, right: p.x + 160, bottom: p.y + 40 };
    const overlaps = !(
      box.right <= control.left ||
      box.left >= control.right ||
      box.bottom <= control.top ||
      box.top >= control.bottom
    );
    expect(overlaps).toBe(false);
  });

  it('never leaves the viewport, even if the bubble is wider than it', () => {
    const p = placeBubble({ ...base, vw: 120, bw: 300 });
    expect(p.x).toBeGreaterThanOrEqual(VIEWPORT_PADDING);
  });
});
