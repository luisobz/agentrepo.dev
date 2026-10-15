import type { EyesKey, FxKey, MouthKey, ScreenKey } from './avatar-art';

/** One drawable frame of the character. Offsets are in grid pixels. */
export interface Pose {
  eyes: EyesKey;
  mouth: MouthKey;
  /** Vertical offset of the head layer (+1 squashes it into the body). */
  headDy?: number;
  /** Vertical offset of the whole figure (negative = in the air). */
  bodyDy?: number;
  /** Where the eyes look: -1 left, 0 front, 1 right (1px shift). */
  lookX?: -1 | 0 | 1;
  screen?: ScreenKey;
  fx?: FxKey | null;
  cheeks?: boolean;
}

/** A named animation: the rows of the sprite sheet. */
export interface SpriteClip {
  frames: readonly Pose[];
  fps: number;
  /** Looping clips repeat; one-shots hold their last frame. */
  loop: boolean;
  /** Frame used when motion is reduced or the page is hidden. */
  staticFrame: number;
  /** Idle-style clips allow random blinking over open eyes. */
  blink?: boolean;
}

export type ClipName =
  | 'idle'
  | 'thinking'
  | 'happy'
  | 'surprised'
  | 'poke'
  | 'takeoff'
  | 'fly'
  | 'land';

const idle: Pose = { eyes: 'open', mouth: 'neutral', screen: 'prompt' };

export const CLIPS: Record<ClipName, SpriteClip> = {
  // Slow breathing: the head sinks one pixel and the cursor blinks with it.
  idle: {
    fps: 2.5,
    loop: true,
    staticFrame: 0,
    blink: true,
    frames: [
      idle,
      { ...idle, screen: 'promptOff' },
      { ...idle, headDy: 1 },
      { ...idle, headDy: 1, screen: 'promptOff' },
    ],
  },
  // Looks up while thought bubbles rise and code appears on the terminal.
  thinking: {
    fps: 3,
    loop: true,
    staticFrame: 3,
    frames: [
      { eyes: 'up', mouth: 'hmm', screen: 'code1', fx: 'think1' },
      { eyes: 'up', mouth: 'hmm', screen: 'code2', fx: 'think2', lookX: -1 },
      {
        eyes: 'up',
        mouth: 'hmm',
        screen: 'code3',
        fx: 'think3',
        lookX: -1,
        headDy: 1,
      },
      { eyes: 'up', mouth: 'hmm', screen: 'code3', fx: 'think3', headDy: 1 },
    ],
  },
  // A little hop with sparkles; the shadow stays on the ground.
  happy: {
    fps: 8,
    loop: true,
    staticFrame: 0,
    frames: [
      { eyes: 'happy', mouth: 'open', screen: 'ok', fx: 'sparkleA', headDy: 1 },
      {
        eyes: 'happy',
        mouth: 'open',
        screen: 'ok',
        fx: 'sparkleA',
        bodyDy: -2,
      },
      {
        eyes: 'happy',
        mouth: 'open',
        screen: 'ok',
        fx: 'sparkleB',
        bodyDy: -3,
        headDy: -1,
      },
      {
        eyes: 'happy',
        mouth: 'open',
        screen: 'ok',
        fx: 'sparkleB',
        bodyDy: -1,
      },
      { eyes: 'happy', mouth: 'smile', screen: 'ok', fx: 'sparkleA' },
      { eyes: 'happy', mouth: 'smile', screen: 'ok', fx: 'sparkleA' },
      { eyes: 'happy', mouth: 'smile', screen: 'ok', fx: 'sparkleB' },
      { eyes: 'happy', mouth: 'smile', screen: 'ok', fx: 'sparkleB' },
    ],
  },
  // Startle: jumps, lands and keeps the wide eyes.
  surprised: {
    fps: 12,
    loop: false,
    staticFrame: 4,
    frames: [
      { eyes: 'closed', mouth: 'neutral', screen: 'alert', headDy: 1 },
      {
        eyes: 'wide',
        mouth: 'o',
        screen: 'alert',
        fx: 'bang',
        bodyDy: -3,
        headDy: -1,
      },
      { eyes: 'wide', mouth: 'o', screen: 'alert', fx: 'bang', bodyDy: -2 },
      { eyes: 'wide', mouth: 'o', screen: 'alert', fx: 'bang', headDy: 1 },
      { eyes: 'wide', mouth: 'o', screen: 'alert', fx: 'bang' },
    ],
  },
  // Reaction to a click: quick squash and a blink.
  poke: {
    fps: 14,
    loop: false,
    staticFrame: 2,
    frames: [
      { eyes: 'squeeze', mouth: 'o', screen: 'prompt', headDy: 1 },
      { eyes: 'squeeze', mouth: 'smile', screen: 'prompt', headDy: 1 },
      { eyes: 'open', mouth: 'smile', screen: 'prompt' },
    ],
  },
  // Anticipation before a flight: crouch and look where it is going.
  takeoff: {
    fps: 12,
    loop: false,
    staticFrame: 1,
    frames: [
      { eyes: 'open', mouth: 'neutral', screen: 'prompt', headDy: 1 },
      { eyes: 'closed', mouth: 'smile', screen: 'prompt', headDy: 1 },
    ],
  },
  // Airborne: lifted one pixel, eyes on the destination.
  fly: {
    fps: 6,
    loop: true,
    staticFrame: 0,
    frames: [
      { eyes: 'open', mouth: 'smile', screen: 'prompt', bodyDy: -1 },
      { eyes: 'open', mouth: 'smile', screen: 'promptOff', bodyDy: -2 },
    ],
  },
  // Arrival: squash, then settle.
  land: {
    fps: 12,
    loop: false,
    staticFrame: 2,
    frames: [
      { eyes: 'closed', mouth: 'neutral', screen: 'prompt', headDy: 1 },
      { eyes: 'closed', mouth: 'smile', screen: 'prompt', headDy: 1 },
      { eyes: 'open', mouth: 'smile', screen: 'prompt' },
    ],
  },
};

/** Duration of a one-shot clip in ms (used to know when it has finished). */
export const clipDurationMs = (clip: SpriteClip) =>
  Math.round((clip.frames.length * 1000) / clip.fps);

/** Sprite sheet layout used by the exporter: one row per clip, 32×36 cells (4px headroom). */
export const SPRITE_SHEET = {
  cellWidth: 32,
  cellHeight: 36,
  rows: Object.keys(CLIPS) as ClipName[],
  columns: Math.max(...Object.values(CLIPS).map((c) => c.frames.length)),
} as const;

/** Blink timing: random interval between blinks and how long the lids stay shut. */
export const BLINK = { minGapMs: 2400, maxGapMs: 5600, closedMs: 120 } as const;
