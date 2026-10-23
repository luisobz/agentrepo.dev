'use client';

import Link from 'next/link';
import { useLocale } from '@agentrepo/ui';
import { useAdminAccess } from '../layout/admin-link';

export function BlogReviewLink() {
  const isAdmin = useAdminAccess();
  const { locale } = useLocale();
  if (!isAdmin) return null;
  return (
    <Link
      href="/blog/review"
      className="mt-5 inline-block text-sm font-medium text-[var(--color-brand-garnet)]"
    >
      {locale === 'es' ? 'Revisar borradores' : 'Review drafts'}
    </Link>
  );
}
