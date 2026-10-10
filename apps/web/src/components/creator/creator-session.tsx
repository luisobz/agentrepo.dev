'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '../../lib/i18n/use-t';

export function CreatorSession({ authorName }: { authorName: string }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const signOut = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch('/auth/signout', { method: 'POST' });
      if (!response.ok) {
        setFailed(true);
        return;
      }
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p>
        {t('creator.author')}: <strong>{authorName}</strong>
      </p>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="underline underline-offset-4 disabled:opacity-50"
      >
        {t('creator.signout')}
      </button>
      {failed && (
        <p role="alert" className="w-full text-red-700">
          {t('creator.network')}
        </p>
      )}
    </div>
  );
}
