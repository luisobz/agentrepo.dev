'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/skills', label: 'Skills', exact: false },
  { href: '/admin/agents', label: 'Agents', exact: false },
  { href: '/admin/blog', label: 'Blog', exact: false },
];

export function AdminNav() {
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
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
