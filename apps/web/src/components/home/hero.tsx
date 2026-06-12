'use client';

import { AvatarSlot, useAvatar } from '@agentrepo/avatar';
import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useCommandPalette } from '../search/command-palette-provider';

export function Hero() {
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
      { threshold: 0.2 }
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
      <AvatarSlot id="hero" preserveSpace={false} />

      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Less noise,{' '}
        <span className="text-[var(--color-brand-garnet)]">more signal</span>
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
        Curated skills, agents and notes for building with AI — no fluff,
        ready to copy into your own stack.
      </p>

      <button
        type="button"
        onClick={open}
        aria-label="Open search"
        className="mt-2 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] px-5 py-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-[1px] hover:border-[var(--color-brand-garnet-muted)] hover:shadow-[var(--shadow-md)]"
      >
        <Search className="h-5 w-5 shrink-0 text-[var(--color-brand-garnet)]" />
        <span className="flex-1 truncate text-[15px] text-[var(--color-text-placeholder)]">
          Search skills, agents and blog posts…
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-2 py-1 font-mono text-xs text-[var(--color-text-muted)] sm:block">
          ⌘K
        </kbd>
      </button>
    </section>
  );
}
