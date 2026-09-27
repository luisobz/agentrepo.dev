'use client';

import { AvatarProvider } from '@agentrepo/avatar';
import { useRouter } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import { useT } from '../../lib/i18n/use-t';

const PORTFOLIO_OWNER_PATH = '/portfolio/luisbz';

/**
 * Envuelve el AvatarProvider genérico con el easter egg del sitio:
 * completar la secuencia de clicks navega al portfolio.
 */
export function AvatarEasterEggProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useT();

  const handleSequenceComplete = useCallback(() => {
    router.push(PORTFOLIO_OWNER_PATH);
  }, [router]);

  return (
    <AvatarProvider
      surpriseMessage={t('avatar.easterEgg.surprise')}
      onSequenceComplete={handleSequenceComplete}
    >
      {children}
    </AvatarProvider>
  );
}
