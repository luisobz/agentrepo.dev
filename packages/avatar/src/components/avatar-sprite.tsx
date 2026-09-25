'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useAvatar, type AvatarEmotion } from './avatar-context';

/** A small hooded coder: pixel art stays crisp when the avatar docks at 75%. */
function PixelKnight({ emotion, face }: { emotion: AvatarEmotion; face: string }) {
  const eyes =
    emotion === 'happy' ? (
      <path d="M11 11h1v-1h2v1h1v2h-1v-1h-2v1h-1zM18 11h1v-1h2v1h1v2h-1v-1h-2v1h-1z" fill={face} />
    ) : emotion === 'thinking' ? (
      <path d="M11 10h4v1h-4zM18 11h4v1h-4zM12 12h2v1h-2zM19 13h2v1h-2z" fill={face} />
    ) : (
      <>
        <path d="M11 10h4v4h-4zM18 10h4v4h-4z" fill={face} />
        <path d="M12 11h1v1h-1zM19 11h1v1h-1z" fill="#fff6de" />
      </>
    );

  const mouth =
    emotion === 'surprised' ? (
      <path d="M16 16h2v3h-2z" fill={face} />
    ) : emotion === 'happy' ? (
      <path d="M13 16h1v1h1v1h4v-1h1v-1h1v2h-1v1h-1v1h-4v-1h-1v-1h-1z" fill={face} />
    ) : emotion === 'thinking' ? (
      <path d="M17 17h3v1h-3z" fill={face} />
    ) : (
      <path d="M15 17h4v1h-4z" fill={face} />
    );

  return (
    <svg
      viewBox="0 0 32 32"
      className="size-11"
      shapeRendering="crispEdges"
      aria-hidden="true"
      data-testid="avatar-pixel-art"
    >
      {/* Boots and the flowing cape sit behind the hood. */}
      <path d="M10 25h5v4H9v-2h1zM18 25h5v2h1v2h-6z" fill="#391c2b" />
      <path d="M10 27h5v2H9v-1h1zM18 27h5v1h1v1h-6z" fill="#f3b65d" />
      <path d="M9 14h16v3h2v3h2v6h-3v2h-5v-2H11v2H6v-3H4v-5h2v-3h3z" fill="#391c2b" />
      <path d="M9 15h15v3h2v3h2v4h-3v2h-4v-2H10v2H7v-3H5v-3h2v-3h2z" fill="#782b41" />
      <path d="M7 20h2v6H7zM23 18h2v7h-2z" fill="#b75765" />
      <path d="M9 24h13v2H9zM14 26h4v2h-4z" fill="#4b1d32" />
      <path d="M12 22h2v2h-2zM19 22h2v2h-2z" fill="#db9b56" />

      {/* Burgundy hood frames the cream face; there is no antenna. */}
      <path d="M12 2h10v1h2v2h2v3h1v9h-2v2H9v-2H7V8h1V5h2V3h2z" fill="#391c2b" />
      <path d="M12 3h10v1h2v2h1v3h1v8h-2v1H10v-1H8V9h1V6h1V4h2z" fill="#882e48" />
      <path d="M11 4h11v1H10v3H9v5H8V8h1V6h1V5h1z" fill="#bf596b" />
      <path d="M23 5h2v4h1v7h-2V9h-1z" fill="#5b2038" />
      <path d="M10 8h14v10h-2v1H12v-1h-2z" fill="#f6dba4" />
      <path d="M11 8h12v1H11z" fill="#fff1c8" />
      <path d="M11 18h12v1H11z" fill="#d99c75" />
      {eyes}
      {mouth}
      <path d="M11 15h2v1h-2zM21 15h2v1h-2z" fill="#d67f81" />
      <path d="M14 20h5v1h-5z" fill="#e2a552" />

      {/* A readable cyan terminal and a small golden shield echo the reference. */}
      <path d="M2 20h10v7H2z" fill="#321d2d" />
      <path d="M3 20h9v7H3z" fill="#6ce9f5" />
      <path d="M4 21h7v5H4z" fill="#0e3549" />
      <path d="M5 22h1v1h1v1H6v1H5v-1h1v-1H5zM8 24h2v1H8z" fill="#adfbff" />
      <path d="M3 26h9v1H3z" fill="#2a708a" />
      <path d="M11 22h2v3h-2z" fill="#eab574" />
      <path d="M25 20h5v1h1v5h-1v1h-5v-1h-1v-5h1z" fill="#4e2534" />
      <path d="M25 21h5v5h-5z" fill="#f3bb68" />
      <path d="M26 22h3v3h-3z" fill="#a35a42" />
      <path d="M27 22h1v3h-1zM26 23h3v1h-3z" fill="#ffe397" />
      <path d="M23 23h2v2h-2z" fill="#eab574" />
    </svg>
  );
}

const SHAKE_KEYFRAMES = {
  x: [0, -3, 3, -3, 3, 0],
  transition: { duration: 0.4 },
};

export function AvatarSprite() {
  const { emotion, isShaking, registerAvatarClick, setup, currentMessage, dismissMessage } = useAvatar();
  const reducedMotion = useReducedMotion();
  const shake = isShaking && !reducedMotion;

  const handleClick = () => {
    if (currentMessage && currentMessage.durationMs === null) {
      dismissMessage();
      return;
    }
    registerAvatarClick();
  };

  return (
    <motion.button
      type="button"
      animate={shake ? SHAKE_KEYFRAMES : { x: 0 }}
      onClick={handleClick}
      aria-label="Interact with mascot"
      data-testid="avatar-sprite"
      data-emotion={emotion}
      data-shaking={isShaking}
      className="flex size-12 cursor-pointer select-none items-center justify-center rounded-xl border-2 shadow-sm transition-transform hover:rotate-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-garnet)]"
      style={{ backgroundColor: setup.colors.background, borderColor: setup.colors.border }}
    >
      <PixelKnight emotion={emotion} face={setup.colors.face} />
    </motion.button>
  );
}
