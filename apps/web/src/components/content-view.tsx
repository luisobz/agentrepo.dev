'use client';
import { useEffect } from 'react';
import { trpc } from './utils/trpc';
export function ContentView({
  kind,
  slug,
}: {
  kind: 'skill' | 'agent' | 'blog';
  slug: string;
}) {
  const { mutate } = trpc.popularity.recordView.useMutation();
  useEffect(() => {
    // A read requires visible time, not a prefetch. No durable visitor identity.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      clearTimeout(timer);
      if (document.visibilityState !== 'visible' || navigator.webdriver) return;
      timer = setTimeout(() => {
        const key = `read:${kind}:${slug}`;
        try {
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, '1');
        } catch {
          /* Storage can be disabled. */
        }
        mutate({ kind, slug });
      }, 10000);
    };
    start();
    document.addEventListener('visibilitychange', start);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', start);
    };
  }, [kind, slug, mutate]);
  return null;
}
