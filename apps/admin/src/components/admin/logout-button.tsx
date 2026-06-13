'use client';

import { Button } from '@agentrepo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '../../lib/i18n/use-t';

export function LogoutButton() {
  const t = useT();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? '…' : t('nav.signOut')}
    </Button>
  );
}
