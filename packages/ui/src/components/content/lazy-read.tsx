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
      className="group my-4 overflow-hidden rounded-[10px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]"
      lang={locale}
      data-testid="lazy-read"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-[10px] bg-[var(--color-brand-garnet-ghost)] px-3 py-2.5 outline-none transition-colors hover:bg-[var(--color-bg-base)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-garnet)] [&::-webkit-details-marker]:hidden">
        <span
          className="shrink-0 text-[var(--color-brand-garnet)]"
          aria-hidden="true"
        >
          <Coffee className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-base font-semibold leading-6">
          Lazy Read
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div
        className="border-t border-[var(--color-border-soft)] px-2.5 py-2"
        lang={contentLocale}
      >
        <p className="m-0 whitespace-pre-line text-base leading-relaxed [overflow-wrap:anywhere] text-[var(--color-text-primary)]">
          {summary}
        </p>
        {points.length > 0 && (
          <ul className="mt-3 grid list-none grid-cols-1 gap-1.5 p-0 sm:grid-cols-3">
            {points.map((point, index) => {
              const Icon = icons[index % icons.length];
              return (
                <li
                  key={point}
                  className="flex min-w-0 items-center gap-2 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-base)] px-2.5 py-2 text-sm leading-snug [overflow-wrap:anywhere]"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-[var(--color-brand-garnet)]"
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
