import { ContentLanguage } from '../../../components/content-language';
import { getServerLocale } from '../../../lib/i18n/server';
import { SHARE_IMAGE } from '../../../lib/seo/public-site';
import { RelatedLinks } from '@agentrepo/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentCover, TypeChip } from '@agentrepo/ui';
import { PremiumGate } from '../../../components/premium/premium-gate';
import { SkillContentViewer } from '../../../components/skills/skill-content-viewer';
import { VersionHistory } from '../../../components/versions/version-history';
import { formatDate } from '../../../lib/public-content';
import {
  getPublishedSkillBySlug,
  getSkillVersion,
  getSkillVersions,
} from '../../../lib/skills';

interface SkillPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ version?: string }>;
}

export async function generateMetadata({
  params,
}: SkillPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getPublishedSkillBySlug(slug);
  if (!skill) {
    return { title: 'Skill not found | AgentRepo.dev' };
  }

  const description =
    skill.description ?? `${skill.title} — a reusable ${skill.type} skill.`;
  return {
    title: `${skill.title} | AgentRepo.dev Skills`,
    description,
    alternates: { canonical: `/skills/${slug}` },
    openGraph: {
      images: [SHARE_IMAGE],
      title: skill.title,
      description,
      type: 'article',
      url: `/skills/${skill.slug}`,
    },
  };
}

function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length;
}

export default async function SkillPage({
  params,
  searchParams,
}: SkillPageProps) {
  const [{ slug }, { version: requestedVersion }] = await Promise.all([
    params,
    searchParams,
  ]);
  const locale = await getServerLocale();
  const [skill, versions] = await Promise.all([
    getPublishedSkillBySlug(slug),
    getSkillVersions(slug),
  ]);
  if (!skill) {
    notFound();
  }

  // A pinned version (?version=x.y.z) swaps the served content npm-style.
  const pinned =
    requestedVersion && requestedVersion !== skill.version
      ? await getSkillVersion(slug, requestedVersion)
      : null;
  if (requestedVersion && requestedVersion !== skill.version && !pinned) {
    notFound();
  }

  const shownVersion = pinned?.version ?? skill.version;
  const shownContent = pinned?.content ?? skill.content;
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
      lang={pinned?.contentLocale ?? skill.contentLocale}
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
          {pinned ? (
            <Link
              href={`/skills/${skill.slug}`}
              className="font-mono text-xs text-[var(--color-text-muted)] underline-offset-2 hover:underline"
            >
              ver latest (v{skill.version})
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
              <time dateTime={skill.updatedAt.toISOString()}>
                {formatDate(skill.updatedAt, locale)}
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
      <ContentLanguage
        contentLocale={pinned?.contentLocale ?? skill.contentLocale}
      />
      <RelatedLinks links={skill.relatedLinks} />

      <ContentCover
        title={skill.title}
        kind="skill"
        imageUrl={skill.headerImageUrl}
        className="mb-8 h-44 w-full rounded-[12px] sm:h-56"
      />

      {skill.isLocked ? (
        <PremiumGate
          priceCents={skill.priceCents}
          currency={skill.currency}
          previewContent={skill.previewContent}
        />
      ) : (
        <SkillContentViewer
          locale={locale}
          content={shownContent}
          downloadFileName={`${skill.slug}-${shownVersion}-${pinned?.contentLocale ?? skill.contentLocale}.md`}
          trackDownload={{ slug: skill.slug, version: shownVersion }}
        />
      )}

      <VersionHistory
        locale={locale}
        versions={versions}
        basePath={`/skills/${skill.slug}`}
        currentVersion={shownVersion}
      />
    </div>
  );
}
