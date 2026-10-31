'use client';

import Link from '../localized-link';

import { AvatarSlot, useAvatar } from '@agentrepo/avatar';
import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useCommandPalette } from '../search/command-palette-provider';
import { useT } from '../../lib/i18n/use-t';

export function Hero() {
  const t = useT();
  const { setAvatarPosition } = useAvatar();
  const { open } = useCommandPalette();
  const heroRef = useRef<HTMLElement>(null);

  // The avatar lives in the hero while it is visible and retreats to the
  // header bubble once the visitor scrolls past it.
  useEffect(() => {
    const node = heroRef.current;
    if (!node) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setAvatarPosition(entry.isIntersecting ? 'hero' : 'header'),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      setAvatarPosition('header');
    };
  }, [setAvatarPosition]);

  return (
    <section
      ref={heroRef}
      className="flex flex-col items-center gap-6 py-16 text-center sm:py-24"
    >
      <div className="flex flex-col items-center gap-2">
        <AvatarSlot id="hero" preserveSpace={false} />
        <Link
          href="/creator"
          className="relative rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--color-brand-garnet)] focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span
            aria-hidden="true"
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]"
          />
          <span className="relative block font-medium">
            {t('contribute.hero')}
          </span>
          <span className="mt-0.5 block text-xs text-[var(--color-brand-garnet)]">
            {t('contribute.heroAction')} →
          </span>
        </Link>
      </div>

      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        {t('hero.titleLead')}{' '}
        <span className="text-[var(--color-brand-garnet)]">
          {t('hero.titleAccent')}
        </span>
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
        {t('hero.subtitle')}
      </p>

      <button
        type="button"
        onClick={open}
        aria-label="Open search"
        className="mt-2 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] px-5 py-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-[1px] hover:border-[var(--color-brand-garnet-muted)] hover:shadow-[var(--shadow-md)]"
      >
        <Search className="h-5 w-5 shrink-0 text-[var(--color-brand-garnet)]" />
        <span className="flex-1 truncate text-[15px] text-[var(--color-text-placeholder)]">
          {t('hero.searchPlaceholder')}
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-2 py-1 font-mono text-xs text-[var(--color-text-muted)] sm:block">
          ⌘K
        </kbd>
      </button>
    </section>
  );
}
