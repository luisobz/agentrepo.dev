/**
 * Default avatar configuration.
 *
 * This file holds the *baseline* look & feel of the avatar: how fast it moves,
 * the kind of movement it uses when it flies between slots, and its colors.
 * Edit these defaults to change the out-of-the-box behavior everywhere.
 *
 * At runtime the app can override any of this through the API:
 *   const { configureAvatar } = useAvatar();
 *   configureAvatar({ speed: 0.5, movement: 'jump', colors: { face: '#fff' } });
 */

/** How the avatar travels between two docking slots. */
export type AvatarMovement =
  | 'glide' // smooth ease-in-out (accelerate, then decelerate)
  | 'linear' // constant speed, no easing
  | 'bounce' // eases in and overshoots slightly on arrival
  | 'jump' // arcs upward like a hop between positions
  | 'fade'; // dissolves out at the origin and back in at the destination

export interface AvatarColors {
  /** Eyes / mouth strokes of the face. */
  face: string;
  /** Sprite tile background. */
  background: string;
  /** Sprite tile border. */
  border: string;
}

export interface AvatarSetup {
  movement: AvatarMovement;
  /** Global speed multiplier applied to every flight: <1 slower, >1 faster. */
  speed: number;
  /** Base flight time in ms, before distance and the speed multiplier. */
  durationBaseMs: number;
  /** Extra ms added per pixel of travel distance. */
  durationPerPxMs: number;
  /** Lower/upper clamps for the computed flight duration (ms). */
  durationMinMs: number;
  durationMaxMs: number;
  /** Peak arc height (px) used by the 'jump' movement. */
  jumpArc: number;
  /**
   * Slot the avatar retreats to when its current slot scrolls off-screen, so it
   * is always visible. Kept as a plain string to avoid a type cycle.
   */
  fallbackSlot: string;
  /** How long (ms) the current slot may stay off-screen before falling back. */
  offscreenFallbackMs: number;
  colors: AvatarColors;
}

/** A partial override of the setup; `colors` can be partially overridden too. */
export type AvatarSetupInput = Partial<Omit<AvatarSetup, 'colors'>> & {
  colors?: Partial<AvatarColors>;
};

export const DEFAULT_AVATAR_SETUP: AvatarSetup = {
  movement: 'glide',
  speed: 1,
  // Calm, deliberate pacing — the avatar glides rather than darts.
  durationBaseMs: 420,
  durationPerPxMs: 1.1,
  durationMinMs: 520,
  durationMaxMs: 1600,
  jumpArc: 60,
  fallbackSlot: 'header',
  offscreenFallbackMs: 150,
  colors: {
    face: 'var(--color-brand-garnet)',
    background: 'var(--color-bg-surface)',
    border: 'var(--color-brand-garnet-muted)',
  },
};

/** Shallow-merges an override onto a setup, deep-merging the `colors` map. */
export function mergeAvatarSetup(
  base: AvatarSetup,
  input?: AvatarSetupInput
): AvatarSetup {
  if (!input) {
    return base;
  }
  const { colors, ...rest } = input;
  return {
    ...base,
    ...rest,
    colors: { ...base.colors, ...(colors ?? {}) },
  };
}
