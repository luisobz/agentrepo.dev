import Link from '../../components/localized-link';
import { getPublishedSkillBySlug } from '../../lib/skills';
import { skillVersionHref } from '../../lib/skill-release';
import { getServerT } from '../../lib/i18n/server';
import { ContributorLogin } from '../../components/creator/contributor-login';
import type { Metadata } from 'next';
import { CreatorSession } from '../../components/creator/creator-session';
import { CreatorForm } from '../../components/creator/creator-form';
import { getAuthenticatedUser } from '../../lib/supabase/server';

export const metadata: Metadata = {
  title: 'Creator | AgentRepo.dev',
  robots: { index: false, follow: false },
  description: 'Propose a skill, agent project or article to AgentRepo.dev.',
};

export default async function CreatorPage() {
  const t = await getServerT();
  const writer = await getPublishedSkillBySlug('writer').catch(() => null);
  const user = await getAuthenticatedUser();
  const metadataName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name;
  const authorName =
    typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : (user?.email?.split('@')[0] ?? '');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <header className="mb-8 mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-brand-garnet)]">
          Creator Studio
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('creator.heading')}
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
          {t('creator.pageInfo')}
        </p>
      </header>
      {writer && (
        <aside className="mb-8 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-4 text-sm text-[var(--color-text-secondary)]">
          <p>
            {t('creator.writerRecommendation')}{' '}
            <Link
              href={skillVersionHref('writer', writer.version)}
              className="font-semibold text-[var(--color-brand-garnet)] underline underline-offset-4"
            >
              Writer
            </Link>
            {t('creator.writerBenefit')}
          </p>
        </aside>
      )}
      {user ? (
        <>
          <CreatorSession authorName={authorName} />
          <CreatorForm authorName={authorName} />
        </>
      ) : (
        <ContributorLogin />
      )}
    </div>
  );
}
