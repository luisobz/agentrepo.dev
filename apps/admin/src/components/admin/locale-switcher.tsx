'use client';

import { LOCALES, useLocale } from '@agentrepo/ui';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 px-3 font-mono text-xs">
      {LOCALES.map((candidate) => (
        <button
          key={candidate}
          type="button"
          aria-pressed={locale === candidate}
          onClick={() => setLocale(candidate)}
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
