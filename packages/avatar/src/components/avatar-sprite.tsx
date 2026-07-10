'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useAvatar, type AvatarEmotion } from './avatar-context';

function Face({ emotion, color }: { emotion: AvatarEmotion; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7" role="presentation">
      {emotion === 'surprised' ? (
        <>
          <circle cx="8" cy="9" r="2.4" fill={color} />
          <circle cx="16" cy="9" r="2.4" fill={color} />
          <circle cx="12" cy="16.5" r="2" fill="none" stroke={color} strokeWidth="1.8" />
        </>
      ) : emotion === 'thinking' ? (
        <>
          <rect x="6" y="8.4" width="4" height="1.6" rx="0.8" fill={color} />
          <rect x="14" y="8.4" width="4" height="1.6" rx="0.8" fill={color} />
          <path d="M9 16.5 h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : emotion === 'happy' ? (
        <>
          <circle cx="8" cy="9" r="1.8" fill={color} />
          <circle cx="16" cy="9" r="1.8" fill={color} />
          <path d="M7.5 14.5 Q12 19 16.5 14.5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="8" cy="9" r="1.8" fill={color} />
          <circle cx="16" cy="9" r="1.8" fill={color} />
          <path d="M9 16 h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// El spring global no soporta keyframes múltiples: la vibración lleva su propia duración.
const SHAKE_KEYFRAMES = {
  x: [0, -3, 3, -3, 3, 0],
  transition: { duration: 0.4 },
};

export function AvatarSprite() {
  const {
    emotion,
    isShaking,
    registerAvatarClick,
    setup,
    currentMessage,
    dismissMessage,
  } = useAvatar();
  const reducedMotion = useReducedMotion();
  const shake = isShaking && !reducedMotion;

  const handleClick = () => {
    // A permanent message acts like a prompt: a click closes it first.
    if (currentMessage && currentMessage.durationMs === null) {
      dismissMessage();
      return;
    }
    registerAvatarClick();
  };

  return (
    <motion.div
      animate={shake ? SHAKE_KEYFRAMES : { x: 0 }}
      onClick={handleClick}
      aria-hidden="true"
      data-testid="avatar-sprite"
      data-emotion={emotion}
      data-shaking={isShaking}
      className="flex size-12 cursor-pointer select-none items-center justify-center rounded-2xl border shadow-sm transition-transform hover:rotate-3"
      style={{
        backgroundColor: setup.colors.background,
        borderColor: setup.colors.border,
      }}
    >
      <Face emotion={emotion} color={setup.colors.face} />
    </motion.div>
  );
}
