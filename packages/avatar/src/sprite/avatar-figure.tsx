'use client';

import { useMemo } from 'react';
import { PALETTE } from './avatar-art';
import {
  CLIPS,
  type ClipName,
  type Pose,
  type SpriteClip,
} from './avatar-clips';
import { poseToPaths } from './compose';
import {
  useBlink,
  useClipFrame,
  usePageVisible,
  usePrefersReducedMotion,
} from './use-sprite-clock';

export interface AvatarFigureProps {
  /** Clip to play (a name from {@link CLIPS} or a custom clip). */
  clip: ClipName | SpriteClip;
  /** Set to false to freeze on the clip's static frame. */
  playing?: boolean;
  /** Eye / mouth color; accepts CSS variables. */
  face?: string;
  /** Rendered size in CSS px (the art is a 32px grid). */
  size?: number;
  /** Forces where the eyes look (overrides the clip). */
  lookX?: -1 | 0 | 1;
  /** Changing this replays the clip from its first frame. */
  restartKey?: unknown;
}

/**
 * Pure renderer of the pixel character. It owns the per-frame animation (clip
 * frames, blinking) and nothing else: positioning on the page belongs to the
 * stage. Honors prefers-reduced-motion and pauses while the tab is hidden.
 */
export function AvatarFigure({
  clip,
  playing = true,
  face = 'var(--color-brand-garnet, #7a2230)',
  size = 48,
  lookX,
  restartKey,
}: AvatarFigureProps) {
  const reducedMotion = usePrefersReducedMotion();
  const visible = usePageVisible();
  const resolved = typeof clip === 'string' ? CLIPS[clip] : clip;
  const animate = playing && !reducedMotion && visible;
  const frameIndex = useClipFrame(resolved, animate, restartKey);
  const blinking = useBlink(animate && Boolean(resolved.blink));

  const pose: Pose = useMemo(() => {
    const base = resolved.frames[frameIndex] ?? resolved.frames[0];
    const withLook = lookX === undefined ? base : { ...base, lookX };
    return blinking && withLook.eyes === 'open'
      ? { ...withLook, eyes: 'closed' }
      : withLook;
  }, [resolved, frameIndex, lookX, blinking]);
  const paths = poseToPaths(pose);

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      data-testid="avatar-pixel-art"
      data-clip={typeof clip === 'string' ? clip : 'custom'}
      data-frame={frameIndex}
      data-animated={animate}
      style={{ display: 'block', overflow: 'visible', color: face }}
    >
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          fill={p.key === 'E' ? 'currentColor' : PALETTE[p.key]}
        />
      ))}
    </svg>
  );
}
