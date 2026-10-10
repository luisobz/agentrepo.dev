'use client';

import { useT } from '../lib/i18n/use-t';

export default function Loading() {
  const t = useT();
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-5xl px-6 pb-24"
    >
      <p className="mb-8 text-sm text-[var(--color-text-muted)]">
        {t('common.loading')}
      </p>
      <div aria-hidden="true" className="motion-safe:animate-pulse space-y-5">
        <div className="h-9 w-48 rounded bg-[var(--color-border-soft)]" />
        <div className="h-5 max-w-lg rounded bg-[var(--color-border-soft)]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="h-48 rounded-xl bg-[var(--color-border-soft)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
