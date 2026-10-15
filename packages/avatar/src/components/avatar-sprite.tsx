'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CLIPS, clipDurationMs, type ClipName } from '../sprite/avatar-clips';
import { AvatarFigure } from '../sprite/avatar-figure';
import { usePrefersReducedMotion } from '../sprite/use-sprite-clock';
import { useAvatar, type AvatarEmotion } from './avatar-context';

/** Flight phase reported by the stage so the character can act out a move. */
export type AvatarTravelPhase = 'takeoff' | 'fly' | 'land';

export interface AvatarTravel {
  phase: AvatarTravelPhase;
  /** Horizontal direction of the flight: -1 left, 0 vertical, 1 right. */
  dir: -1 | 0 | 1;
}

const EMOTION_CLIP: Record<AvatarEmotion, ClipName> = {
  idle: 'idle',
  happy: 'happy',
  thinking: 'thinking',
  surprised: 'surprised',
};

/** Styles live with the component so it works in any host (no Tailwind needed). */
export const AVATAR_SPRITE_CSS = `
.ar-avatar-btn{position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px;padding:0;margin:0;border:0;border-radius:14px;background:transparent;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.ar-avatar-btn::before{content:"";position:absolute;inset:3px;border-radius:12px;background:var(--ar-avatar-halo);opacity:0;transform:scale(.85);transition:opacity .18s ease,transform .18s ease}
.ar-avatar-btn:hover::before{opacity:.9;transform:scale(1)}
.ar-avatar-btn:focus-visible{outline:2px solid var(--ar-avatar-ring);outline-offset:2px}
.ar-avatar-btn:focus-visible::before{opacity:.9;transform:scale(1)}
.ar-avatar-btn>svg{position:relative;image-rendering:pixelated}
.ar-avatar-btn[data-shake=true]{animation:ar-avatar-shake .4s steps(5,end)}
@keyframes ar-avatar-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-3px)}40%,80%{transform:translateX(3px)}}
@media (prefers-reduced-motion:reduce){.ar-avatar-btn::before{transition:none}.ar-avatar-btn[data-shake=true]{animation:none}}
`;

export interface AvatarSpriteProps {
  /** Set by the stage while the avatar travels between slots. */
  travel?: AvatarTravel | null;
}

export function AvatarSprite({ travel = null }: AvatarSpriteProps = {}) {
  const {
    emotion,
    isShaking,
    registerAvatarClick,
    setup,
    currentMessage,
    dismissMessage,
  } = useAvatar();
  const reducedMotion = usePrefersReducedMotion();
  const shake = isShaking && !reducedMotion;
  const [pokes, setPokes] = useState(0);
  const [poking, setPoking] = useState(false);
  const pokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pokeTimer.current) clearTimeout(pokeTimer.current);
    },
    [],
  );

  const persistentMessage = Boolean(
    currentMessage && currentMessage.durationMs === null,
  );

  const handleClick = () => {
    if (persistentMessage) {
      dismissMessage();
      return;
    }
    registerAvatarClick();
    // A short squash acknowledges the click unless an emotion takes over.
    setPokes((n) => n + 1);
    setPoking(true);
    if (pokeTimer.current) clearTimeout(pokeTimer.current);
    pokeTimer.current = setTimeout(
      () => setPoking(false),
      clipDurationMs(CLIPS.poke),
    );
  };

  // Priority: travel acting > click reaction (only over idle) > emotion.
  const clip: ClipName = travel
    ? travel.phase
    : poking && emotion === 'idle'
      ? 'poke'
      : EMOTION_CLIP[emotion];
  const lookX = travel && travel.phase !== 'land' ? travel.dir : undefined;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        persistentMessage ? 'Dismiss mascot message' : 'Interact with mascot'
      }
      data-testid="avatar-sprite"
      data-emotion={emotion}
      data-shaking={isShaking}
      data-shake={shake}
      data-clip={clip}
      data-travel={travel?.phase ?? 'none'}
      className="ar-avatar-btn"
      style={
        {
          '--ar-avatar-halo': setup.colors.background,
          '--ar-avatar-ring': setup.colors.border,
        } as CSSProperties
      }
    >
      <style href="agentrepo-avatar-sprite" precedence="default">
        {AVATAR_SPRITE_CSS}
      </style>
      <AvatarFigure
        clip={clip}
        face={setup.colors.face}
        size={48}
        lookX={lookX}
        restartKey={clip === 'poke' ? pokes : travel?.phase}
      />
    </button>
  );
}
