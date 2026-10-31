import { Plus } from 'lucide-react';
import Link from '../localized-link';
import {
  contributionHref,
  type ContributionKind,
} from '../../lib/contribution';
import { getServerT } from '../../lib/i18n/server';

export async function ContributeLink({ kind }: { kind: ContributionKind }) {
  const t = await getServerT();
  return (
    <Link
      href={contributionHref(kind)}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-brand-garnet)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {t(`contribute.${kind}`)}
    </Link>
  );
}
