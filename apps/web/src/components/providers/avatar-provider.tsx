'use client';

import { AvatarProvider } from '@agentrepo/avatar';
import { useRouter } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import { PORTFOLIO_OWNER_PATH, unlockPortfolio } from '../../lib/portfolio-unlock';

/**
 * Envuelve el AvatarProvider genérico con el easter egg del sitio:
 * completar la secuencia de clicks desbloquea el portfolio y navega a él.
 */
export function AvatarEasterEggProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleSequenceComplete = useCallback(() => {
    unlockPortfolio();
    router.push(PORTFOLIO_OWNER_PATH);
  }, [router]);

  return (
    <AvatarProvider onSequenceComplete={handleSequenceComplete}>
      {children}
    </AvatarProvider>
  );
}
