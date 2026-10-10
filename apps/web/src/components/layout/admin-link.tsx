'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useT } from '../../lib/i18n/use-t';

export function AdminLink({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const t = useT();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let latestCheck = 0;
    const check = async () => {
      const checkId = ++latestCheck;
      setIsAdmin(false);
      try {
        const response = await fetch('/auth/admin-access', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const result: unknown = response.ok ? await response.json() : null;
        if (!controller.signal.aborted && checkId === latestCheck) {
          setIsAdmin(
            typeof result === 'object' &&
              result !== null &&
              'isAdmin' in result &&
              result.isAdmin === true,
          );
        }
      } catch {
        /* Hidden on network failure or unmount. */
      }
    };
    void check();
    window.addEventListener('focus', check);
    window.addEventListener('auth-session-changed', check);
    return () => {
      controller.abort();
      window.removeEventListener('focus', check);
      window.removeEventListener('auth-session-changed', check);
    };
  }, [pathname]);

  if (!isAdmin) return null;
  return (
    <a
      href="https://admin.agentrepo.dev/api/auth/sso"
      className={className}
      onClick={onClick}
    >
      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      {t('nav.admin')}
    </a>
  );
}
