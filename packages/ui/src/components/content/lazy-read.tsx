import {
  ChevronDown,
  Coffee,
  FileText,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import type { Locale } from '../../i18n/locale-core';

export function LazyRead({
  summary,
  points = [],
  locale,
  contentLocale = locale,
}: {
  summary: string;
  points?: string[];
  locale: Locale;
  contentLocale?: Locale;
}) {
  if (!summary.trim()) return null;
  const icons = [FileText, ShieldCheck, Layers];
  return (
    <details
      className="group my-7 overflow-hidden rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)]"
      lang={locale}
      data-testid="lazy-read"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[24px] bg-[var(--color-brand-garnet-ghost)] px-4 py-4 outline-none transition-colors hover:bg-[var(--color-bg-base)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-garnet)] [&::-webkit-details-marker]:hidden sm:px-5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-base)] text-[var(--color-brand-garnet)]"
          aria-hidden="true"
        >
          <Coffee className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold leading-tight">
            Lazy Read
          </span>
          <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">
            {locale === 'es' ? 'Un resumen sencillo' : 'A simple summary'}
          </span>
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="px-4 pb-5 pt-4 sm:px-5" lang={contentLocale}>
        <p className="m-0 whitespace-pre-line text-base leading-relaxed text-[var(--color-text-primary)] sm:text-lg">
          {summary}
        </p>
        {points.length > 0 && (
          <ul className="mt-4 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-3">
            {points.map((point, index) => {
              const Icon = icons[index % icons.length];
              return (
                <li
                  key={point}
                  className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-base)] px-3 py-3 text-sm leading-snug [overflow-wrap:anywhere]"
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-[var(--color-brand-garnet)]"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}
