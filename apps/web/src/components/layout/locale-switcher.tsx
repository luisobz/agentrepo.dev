'use client';

import { LOCALES, useLocale } from '@agentrepo/ui';
import { useRouter } from 'next/navigation';

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  return (
    <div className={`flex items-center gap-1 font-mono text-xs ${className ?? ''}`}>
      {LOCALES.map((candidate) => (
        <button
          key={candidate}
          type="button"
          aria-pressed={locale === candidate}
          onClick={() => {
            setLocale(candidate);
            router.refresh();
          }}
          className={`rounded px-1.5 py-0.5 uppercase transition-colors ${
            locale === candidate
              ? 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          {candidate}
        </button>
      ))}
    </div>
  );
}
