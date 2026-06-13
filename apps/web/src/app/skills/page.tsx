import Link from 'next/link';
import type { Metadata } from 'next';
import { ContentCover, TypeChip } from '@agentrepo/ui';
import { getServerLocale, getServerT } from '../../lib/i18n/server';
import { formatPrice } from '../../lib/format-price';
import { formatDate } from '../../lib/public-content';
import { getPublishedSkills } from '../../lib/skills';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Skills | AgentRepo.dev',
  description:
    'Reusable prompts, system instructions, configs and templates for AI agents.',
};

export default async function SkillsPage() {
  const [skills, locale, t] = await Promise.all([
    getPublishedSkills(),
    getServerLocale(),
    getServerT(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('skills.title')}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          {t('skills.subtitle')}
        </p>
      </header>

      {skills.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">{t('common.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.slug}`}
              className="group flex flex-col overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)] transition-all hover:-translate-y-[2px] hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-sm)]"
            >
              <ContentCover
                title={skill.title}
                kind="skill"
                imageUrl={skill.headerImageUrl}
                className="h-28 w-full"
              />
              <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between gap-2">
                <TypeChip type={skill.type} />
                {skill.isPremium && skill.priceCents != null && (
                  <span className="rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
                    {t('premium.badge')} · {formatPrice(skill.priceCents, skill.currency, locale)}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand-garnet)]">
                {skill.title}
              </h2>
              {skill.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {skill.description}
                </p>
              )}
              <time
                dateTime={skill.updatedAt.toISOString()}
                className="mt-auto pt-4 font-mono text-xs text-[var(--color-text-muted)]"
              >
                {t('common.updated')} {formatDate(skill.updatedAt)}
              </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
