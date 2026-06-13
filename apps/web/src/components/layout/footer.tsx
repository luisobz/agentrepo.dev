'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AvatarSlot } from '@agentrepo/avatar';
import { useT } from '../../lib/i18n/use-t';

export function Footer() {
  const t = useT();
  const pathname = usePathname();

  // The portfolio is an immersive standalone pitch: no repo chrome there.
  if (pathname?.startsWith('/portfolio')) {
    return null;
  }

  return (
    <footer className="mt-12 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <AvatarSlot id="footer" preserveSpace={false} />
          <div>
            <p className="font-mono text-sm font-semibold">
              agentrepo
              <span className="text-[var(--color-brand-garnet)]">.dev</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-6 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          <Link href="/skills" className="transition-colors hover:text-[var(--color-brand-garnet)]">
            {t('nav.skills')}
          </Link>
          <Link href="/agents" className="transition-colors hover:text-[var(--color-brand-garnet)]">
            {t('nav.agents')}
          </Link>
          <Link href="/blog" className="transition-colors hover:text-[var(--color-brand-garnet)]">
            {t('nav.blog')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
