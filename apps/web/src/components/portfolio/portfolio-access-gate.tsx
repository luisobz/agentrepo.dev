'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  isPortfolioPublicByEnv,
  isPortfolioUnlocked,
} from '../../lib/portfolio-unlock';

/**
 * El portfolio es secreto: sólo se muestra si el easter egg del avatar fue
 * completado (localStorage) o si el perfil está en modo público por ENV.
 * Mientras se comprueba no se renderiza nada para no revelar el contenido.
 */
export function PortfolioAccessGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [access, setAccess] = useState<'checking' | 'granted'>(() =>
    isPortfolioPublicByEnv() ? 'granted' : 'checking',
  );

  useEffect(() => {
    if (access === 'granted') {
      return;
    }
    if (isPortfolioUnlocked()) {
      setAccess('granted');
    } else {
      router.replace('/');
    }
  }, [access, router]);

  if (access !== 'granted') {
    return null;
  }
  return <>{children}</>;
}
