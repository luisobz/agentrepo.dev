'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useT } from '../../lib/i18n/use-t';
import type { AdminDictionaryKey } from '../../lib/i18n/dictionary';

const NAV_ITEMS: { href: string; labelKey: AdminDictionaryKey; exact: boolean }[] = [
  { href: '/admin', labelKey: 'nav.dashboard', exact: true },
  { href: '/admin/skills', labelKey: 'nav.skills', exact: false },
  { href: '/admin/agents', labelKey: 'nav.agents', exact: false },
  { href: '/admin/blog', labelKey: 'nav.blog', exact: false },
];

export function AdminNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
