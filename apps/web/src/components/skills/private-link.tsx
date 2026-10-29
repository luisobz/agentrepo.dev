'use client';
import Link from '../localized-link';
import { useLocale } from '@agentrepo/ui';
import { useAdminAccess } from '../layout/admin-link';
export function PrivateSkillsLink() {
  const admin = useAdminAccess();
  const { locale } = useLocale();
  return admin ? (
    <Link
      href="/skills/private"
      className="mt-5 inline-block text-sm font-medium text-[var(--color-brand-garnet)]"
    >
      {locale === 'es' ? 'Mis skills privadas' : 'My private skills'}
    </Link>
  ) : null;
}
