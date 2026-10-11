'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { useT } from '../../lib/i18n/use-t';
import { AdminNav, currentAdminSection } from './admin-nav';
import { LocaleSwitcher } from './locale-switcher';
import { LogoutButton } from './logout-button';

function NavigationPanel({ pathname }: { pathname: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <aside
      className="sticky top-0 z-30 w-full shrink-0 self-start border-b border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] md:flex md:h-dvh md:w-64 md:flex-col md:border-b-0 md:border-r"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="flex min-h-20 items-center gap-2 px-4 py-3 md:flex-col md:items-stretch md:gap-4 md:p-5">
        <a
          href="https://agentrepo.dev"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--color-brand-garnet)]"
          aria-label="agentrepo.dev"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-garnet)] font-mono text-xs font-bold text-white">
            AR
          </span>
          <span className="min-w-0">
            <span className="block truncate font-mono text-sm font-semibold text-[var(--color-brand-garnet)]">
              agentrepo.dev
            </span>
            <span className="block truncate text-xs text-[var(--color-text-muted)] md:hidden">
              {t(currentAdminSection(pathname))}
            </span>
            <span className="hidden text-xs text-[var(--color-text-muted)] md:block">
              {t('nav.adminPanel')}
            </span>
          </span>
        </a>
        <a
          href="https://agentrepo.dev"
          className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-lg border border-[var(--color-border-soft)] px-2.5 text-xs font-medium text-[var(--color-brand-garnet)] transition-colors hover:bg-[var(--color-brand-garnet-ghost)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-garnet)] md:text-sm"
        >
          {t('nav.viewWebsite')}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
        <button
          ref={toggle}
          type="button"
          aria-label={open ? t('nav.closeNavigation') : t('nav.openNavigation')}
          aria-expanded={open}
          aria-controls="admin-navigation"
          onClick={() => setOpen(!open)}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-[var(--color-brand-garnet)] hover:bg-[var(--color-brand-garnet-ghost)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-garnet)] md:hidden"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
      <div
        id="admin-navigation"
        className={`${open ? 'flex' : 'hidden'} max-h-[calc(100dvh-5rem)] flex-col overflow-y-auto px-4 pb-4 md:flex md:min-h-0 md:flex-1 md:px-5 md:pb-5`}
      >
        <AdminNav onNavigate={() => setOpen(false)} />
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--color-border-soft)] pt-4 md:mt-auto md:pt-5">
          <LocaleSwitcher />
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

export function AdminNavigation() {
  const pathname = usePathname();
  return <NavigationPanel key={pathname} pathname={pathname} />;
}
