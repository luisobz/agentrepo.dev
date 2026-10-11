'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  FileText,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Mail,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { useT } from '../../lib/i18n/use-t';
import type { AdminDictionaryKey } from '../../lib/i18n/dictionary';

const NAV_ITEMS: {
  href: string;
  labelKey: AdminDictionaryKey;
  exact: boolean;
  icon: LucideIcon;
}[] = [
  {
    href: '/admin',
    labelKey: 'nav.dashboard',
    exact: true,
    icon: LayoutDashboard,
  },
  { href: '/admin/review', labelKey: 'nav.review', exact: false, icon: Inbox },
  {
    href: '/admin/skills',
    labelKey: 'nav.skills',
    exact: false,
    icon: Sparkles,
  },
  { href: '/admin/agents', labelKey: 'nav.agents', exact: false, icon: Bot },
  { href: '/admin/blog', labelKey: 'nav.blog', exact: false, icon: FileText },
  {
    href: '/admin/contacts',
    labelKey: 'nav.contacts',
    exact: false,
    icon: Mail,
  },
  {
    href: '/admin/playground-tokens',
    labelKey: 'nav.playgroundTokens',
    exact: false,
    icon: KeyRound,
  },
];

function isCurrent(item: (typeof NAV_ITEMS)[number], pathname: string) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function currentAdminSection(pathname: string): AdminDictionaryKey {
  return (
    NAV_ITEMS.find((item) => isCurrent(item, pathname))?.labelKey ??
    'nav.dashboard'
  );
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav aria-label={t('nav.navigation')} className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = isCurrent(item, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-garnet)] ${
              isActive
                ? 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
