'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AvatarSlot } from '@agentrepo/avatar';
import { cn } from '@agentrepo/ui';
import { useT } from '../../lib/i18n/use-t';

export function Footer() {
  const t = useT();
  const pathname = usePathname();

  // The portfolio is an immersive standalone pitch: no repo chrome there.
  if (pathname?.startsWith('/portfolio')) {
    return null;
  }

  // The playground is a dark, immersive surface: the footer follows suit
  // instead of dropping the warm-white repo chrome onto a near-black page.
  const onDark = !!pathname?.startsWith('/playground');

  return (
    <footer
      className={cn(
        'border-t',
        // On the dark playground the footer sits flush; elsewhere it keeps its
        // breathing room above the warm-white chrome.
        onDark
          ? 'mt-0 border-white/10 bg-[#14110f]'
          : 'mt-12 border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]/60'
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <AvatarSlot id="footer" preserveSpace={false} />
          <div>
            <p
              className={cn(
                'font-mono text-sm font-semibold',
                onDark && 'text-[#fdf8ef]'
              )}
            >
              agentrepo
              <span className="text-[var(--color-brand-garnet)]">.dev</span>
            </p>
            <p
              className={cn(
                'text-xs',
                onDark ? 'text-[#8d8273]' : 'text-[var(--color-text-muted)]'
              )}
            >
              {t('footer.tagline')}
            </p>
          </div>
        </div>
        <nav
          className={cn(
            'flex items-center gap-6 font-sans text-xs font-semibold uppercase tracking-wider',
            onDark ? 'text-[#cfc6b8]' : 'text-[var(--color-text-secondary)]'
          )}
        >
          <Link
            href="/skills"
            className="transition-colors hover:text-[var(--color-brand-garnet)]"
          >
            {t('nav.skills')}
          </Link>
          <Link
            href="/agents"
            className="transition-colors hover:text-[var(--color-brand-garnet)]"
          >
            {t('nav.agents')}
          </Link>
          <Link
            href="/blog"
            className="transition-colors hover:text-[var(--color-brand-garnet)]"
          >
            {t('nav.blog')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
