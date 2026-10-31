import { AvatarContentScene } from '../../../../components/avatar-content-scene';
import { ContributeLink } from '../../../../components/creator/contribute-link';
import { localizedAlternates } from '../../../../lib/seo/localized-metadata';
import { localizedHref } from '../../../../lib/i18n/routing';
import { ContentLanguage } from '../../../../components/content-language';
import { getServerLocale } from '../../../../lib/i18n/server';
import { SHARE_IMAGE } from '../../../../lib/seo/public-site';
import { RelatedLinks } from '@agentrepo/ui';
import Link from '../../../../components/localized-link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentCover, TypeChip } from '@agentrepo/ui';
import { PremiumGate } from '../../../../components/premium/premium-gate';
import { SkillContentViewer } from '../../../../components/skills/skill-content-viewer';
import { VersionHistory } from '../../../../components/versions/version-history';
import { formatDate } from '../../../../lib/public-content';
import { getSkillVersions } from '../../../../lib/skills';
import {
  getPinnedSkillRelease,
  skillVersionHref,
} from '../../../../lib/skill-release';
import { redirect } from 'next/navigation';

interface SkillPageProps {
  params: Promise<{ slug: string; version: string }>;
}

export async function generateMetadata({
  params,
}: SkillPageProps): Promise<Metadata> {
  const { slug, version } = await params;
  const locale = await getServerLocale();
  if (version === 'latest') redirect(`/skills/${encodeURIComponent(slug)}`);
  const release = await getPinnedSkillRelease(slug, version);
  if (!release) notFound();
  const { skill } = release;
  const path = skillVersionHref(slug, version);

  const description =
    skill.description ??
    `${skill.title}: ${locale === 'es' ? 'una skill reutilizable' : 'a reusable skill'}.`;
  return {
    title: `${skill.title} v${version} | AgentRepo.dev Skills`,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: {
      images: [SHARE_IMAGE],
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      title: `${skill.title} v${version}`,
      description,
      type: 'article',
      url: localizedHref(path, locale),
    },
  };
}

function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { slug, version } = await params;
  if (version === 'latest') redirect(`/skills/${encodeURIComponent(slug)}`);
  const release = await getPinnedSkillRelease(slug, version);
  if (!release) notFound();
  const { skill, pinned } = release;
  const [locale, versions] = await Promise.all([
    getServerLocale(),
    getSkillVersions(slug),
  ]);
  const isHistorical = pinned.version !== skill.version;
  const shownVersion = pinned.version;
  const shownContent = pinned.content;
  const downloadsTotal = versions.reduce(
    (sum, entry) => sum + entry.downloadsTotal,
    0,
  );
  const downloadsWeekly = versions.reduce(
    (sum, entry) => sum + entry.downloadsWeekly,
    0,
  );

  return (
    <div
      lang={pinned.contentLocale}
      className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6"
    >
      <Link
        href="/skills"
        className="font-mono text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand-garnet)]"
      >
        {locale === 'es' ? '← Volver a skills' : '← Back to skills'}
      </Link>

      <header className="mb-8 mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <TypeChip type={skill.type} />
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {skill.slug}
          </span>
          <span className="rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--color-brand-garnet)]">
            v{shownVersion}
          </span>
          {isHistorical ? (
            <Link
              href={skillVersionHref(skill.slug, skill.version)}
              className="font-mono text-xs text-[var(--color-text-muted)] underline-offset-2 hover:underline"
            >
              {locale === 'es' ? 'Ver última' : 'View latest'} (v{skill.version}
              )
            </Link>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              latest
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {skill.title}
        </h1>
        {skill.description && (
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-secondary)]">
            {skill.description}
          </p>
        )}
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-[var(--color-text-muted)]">
          {skill.authorName && (
            <div className="flex gap-1.5">
              <dt>{locale === 'es' ? 'Autoría:' : 'Author:'}</dt>
              <dd>{skill.authorName}</dd>
            </div>
          )}
          <div className="flex gap-1.5">
            <dt>{locale === 'es' ? 'Actualizado:' : 'Updated:'}</dt>
            <dd>
              <time dateTime={pinned.createdAt.toISOString()}>
                {formatDate(pinned.createdAt, locale)}
              </time>
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>{locale === 'es' ? 'Palabras:' : 'Words:'}</dt>
            <dd>{countWords(shownContent)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>
              {locale === 'es' ? 'Descargas semanales:' : 'Weekly downloads:'}
            </dt>
            <dd>{downloadsWeekly.toLocaleString()}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>
              {locale === 'es' ? 'Descargas totales:' : 'Total downloads:'}
            </dt>
            <dd>{downloadsTotal.toLocaleString()}</dd>
          </div>
        </dl>
      </header>
      <AvatarContentScene kind="skill" slug={skill.slug} />
      <ContentLanguage contentLocale={pinned.contentLocale} />
      <RelatedLinks links={skill.relatedLinks} />

      <ContentCover
        title={skill.title}
        kind="skill"
        imageUrl={skill.headerImageUrl}
        className="mb-8 h-44 w-full rounded-[12px] sm:h-56"
      />

      {pinned.isLocked ? (
        <PremiumGate
          priceCents={skill.priceCents}
          currency={skill.currency}
          previewContent={skill.previewContent}
        />
      ) : (
        <SkillContentViewer
          locale={locale}
          content={shownContent}
          downloadFileName={`${skill.slug}-${shownVersion}-${pinned.contentLocale}.md`}
          trackDownload={{ slug: skill.slug, version: shownVersion }}
        />
      )}

      <VersionHistory
        locale={locale}
        versions={versions}
        basePath={`/skills/${skill.slug}`}
        currentVersion={shownVersion}
        versionedPaths
      />
      <div className="mt-8 flex justify-end border-t border-[var(--color-border-soft)] pt-3">
        <ContributeLink kind="skill" />
      </div>
    </div>
  );
}
