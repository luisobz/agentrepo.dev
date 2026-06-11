'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useAvatar, type AvatarEmotion } from './avatar-context';

const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

function Face({ emotion }: { emotion: AvatarEmotion }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7" role="presentation">
      {emotion === 'surprised' ? (
        <>
          <circle cx="8" cy="9" r="2.4" fill="var(--color-brand-garnet)" />
          <circle cx="16" cy="9" r="2.4" fill="var(--color-brand-garnet)" />
          <circle cx="12" cy="16.5" r="2" fill="none" stroke="var(--color-brand-garnet)" strokeWidth="1.8" />
        </>
      ) : emotion === 'thinking' ? (
        <>
          <rect x="6" y="8.4" width="4" height="1.6" rx="0.8" fill="var(--color-brand-garnet)" />
          <rect x="14" y="8.4" width="4" height="1.6" rx="0.8" fill="var(--color-brand-garnet)" />
          <path d="M9 16.5 h5" stroke="var(--color-brand-garnet)" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : emotion === 'happy' ? (
        <>
          <circle cx="8" cy="9" r="1.8" fill="var(--color-brand-garnet)" />
          <circle cx="16" cy="9" r="1.8" fill="var(--color-brand-garnet)" />
          <path d="M7.5 14.5 Q12 19 16.5 14.5" fill="none" stroke="var(--color-brand-garnet)" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="8" cy="9" r="1.8" fill="var(--color-brand-garnet)" />
          <circle cx="16" cy="9" r="1.8" fill="var(--color-brand-garnet)" />
          <path d="M9 16 h6" stroke="var(--color-brand-garnet)" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AvatarSprite() {
  const { emotion } = useAvatar();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      layoutId="avatar-sprite"
      layout={reducedMotion ? false : 'position'}
      transition={reducedMotion ? { duration: 0 } : SPRING}
      aria-hidden="true"
      data-testid="avatar-sprite"
      data-emotion={emotion}
      className="flex size-12 items-center justify-center rounded-2xl border shadow-sm transition-transform hover:rotate-3"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-brand-garnet-muted)',
      }}
    >
      <Face emotion={emotion} />
    </motion.div>
  );
}
