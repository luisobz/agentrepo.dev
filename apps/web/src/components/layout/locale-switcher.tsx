'use client';

import { LOCALES, useLocale } from '@agentrepo/ui';
import { useRouter } from 'next/navigation';

export function LocaleSwitcher({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  const activeClass = onDark
    ? 'bg-[#c4909a]/20 text-[#e8c2ca]'
    : 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]';
  const inactiveClass = onDark
    ? 'text-[#8d8273] hover:text-[#fdf8ef]'
    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]';

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
            locale === candidate ? activeClass : inactiveClass
          }`}
        >
          {candidate}
        </button>
      ))}
    </div>
  );
}
