import type { AvatarMessagePlacement } from './avatar-context';

export const BUBBLE_GAP = 10;
export const VIEWPORT_PADDING = 8;

export type BubbleSide = 'top' | 'bottom' | 'left' | 'right';

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface BubblePlacementInput {
  /** Avatar center and half size (already scaled). */
  cx: number;
  cy: number;
  half: number;
  /** Bubble size. */
  bw: number;
  bh: number;
  placement: AvatarMessagePlacement;
  vw: number;
  vh: number;
  /** Interactive elements the bubble should not cover. */
  obstacles?: readonly Rect[];
}

export interface BubblePlacement {
  x: number;
  y: number;
  side: BubbleSide;
  /** Offset of the tail along the bubble edge, pointing at the avatar. */
  tail: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

const ORDER: Record<AvatarMessagePlacement, BubbleSide[]> = {
  auto: ['bottom', 'top', 'left', 'right'],
  bottom: ['bottom', 'top', 'left', 'right'],
  top: ['top', 'bottom', 'left', 'right'],
  left: ['left', 'right', 'bottom', 'top'],
  right: ['right', 'left', 'bottom', 'top'],
};

/**
 * Chooses where the speech bubble goes. Each side is tried in preference order;
 * a side wins when the bubble fits in the viewport without covering the avatar
 * or an interactive control. If none is clean, the least-covering side wins.
 * The result is always clamped inside the viewport.
 */
export function placeBubble(input: BubblePlacementInput): BubblePlacement {
  const { cx, cy, half, bw, bh, placement, vw, vh, obstacles = [] } = input;
  const pad = VIEWPORT_PADDING;
  const gap = BUBBLE_GAP;
  const avatar: Rect = {
    left: cx - half,
    top: cy - half,
    right: cx + half,
    bottom: cy + half,
  };

  const raw = (side: BubbleSide) => {
    switch (side) {
      case 'bottom':
        return { x: cx - bw / 2, y: cy + half + gap };
      case 'top':
        return { x: cx - bw / 2, y: cy - half - gap - bh };
      case 'right':
        return { x: cx + half + gap, y: cy - bh / 2 };
      default:
        return { x: cx - half - gap - bw, y: cy - bh / 2 };
    }
  };

  let best: BubblePlacement = { x: pad, y: pad, side: 'bottom', tail: bw / 2 };
  let bestScore = Infinity;
  ORDER[placement].forEach((side, rank) => {
    const r = raw(side);
    // A side fits when it has room on its own axis; the other axis is clamped.
    const vertical = side === 'top' || side === 'bottom';
    const fits = vertical
      ? r.y >= pad && r.y + bh <= vh - pad
      : r.x >= pad && r.x + bw <= vw - pad;
    const x = clamp(r.x, pad, Math.max(pad, vw - bw - pad));
    const y = clamp(r.y, pad, Math.max(pad, vh - bh - pad));
    const box: Rect = { left: x, top: y, right: x + bw, bottom: y + bh };
    const covered = obstacles.reduce((sum, o) => sum + overlap(box, o), 0);
    const score =
      (fits ? 0 : 1e6) + overlap(box, avatar) * 100 + covered + rank * 0.5;
    const tail = vertical
      ? clamp(cx - x, 14, bw - 14)
      : clamp(cy - y, 12, bh - 12);
    if (score < bestScore) {
      bestScore = score;
      best = { x, y, side, tail };
    }
  });
  return best;
}
