import { AvatarContentScene } from '../../../components/avatar-content-scene';
import { ContributeLink } from '../../../components/creator/contribute-link';
import { localizedAlternates } from '../../../lib/seo/localized-metadata';
import { localizedHref } from '../../../lib/i18n/routing';
import { ContentLanguage } from '../../../components/content-language';
import { getServerLocale } from '../../../lib/i18n/server';
import { SHARE_IMAGE } from '../../../lib/seo/public-site';
import { RelatedLinks } from '@agentrepo/ui';
import Link from '../../../components/localized-link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentCover } from '@agentrepo/ui';
import { Play } from 'lucide-react';
import { PremiumGate } from '../../../components/premium/premium-gate';
import { AgentDownloadButton } from '../../../components/agents/agent-download-button';
import { AgentWorkbench } from '../../../components/agents/workbench/agent-workbench';
import { MarkdownContent } from '@agentrepo/ui';
import { VersionHistory } from '../../../components/versions/version-history';
import {
  countFiles,
  getAgentVersion,
  getAgentVersions,
  getPublishedAgentBySlug,
  hasPlayground,
} from '../../../lib/agents';
import { formatDate } from '../../../lib/public-content';

interface AgentPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ version?: string }>;
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const agent = await getPublishedAgentBySlug(slug);
  if (!agent) {
    return { title: 'Agent not found | AgentRepo.dev' };
  }

  return {
    title: `${agent.title} | AgentRepo.dev Agents`,
    description: agent.shortDescription,
    alternates: localizedAlternates(`/agents/${slug}`, locale),
    openGraph: {
      images: [SHARE_IMAGE],
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      title: agent.title,
      description: agent.shortDescription,
      type: 'article',
      url: localizedHref(`/agents/${agent.slug}`, locale),
    },
  };
}

export default async function AgentPage({
  params,
  searchParams,
}: AgentPageProps) {
  const [{ slug }, { version: requestedVersion }] = await Promise.all([
    params,
    searchParams,
  ]);
  const locale = await getServerLocale();
  const [agent, versions] = await Promise.all([
    getPublishedAgentBySlug(slug),
    getAgentVersions(slug),
  ]);
  if (!agent) {
    notFound();
  }

  // Downloads use the published snapshot even when it is the latest release;
  // editing a translation draft must not change an already tagged download.
  const pinned = await getAgentVersion(slug, requestedVersion ?? agent.version);
  if (requestedVersion && requestedVersion !== agent.version && !pinned) {
    notFound();
  }
  const isHistorical = (pinned?.version ?? agent.version) !== agent.version;

  const shownVersion = pinned?.version ?? agent.version;
  const shownFileTree = pinned?.fileTree ?? agent.fileTree;
  const shownReadme = pinned ? pinned.readmeContent : agent.readmeContent;
  const downloadsTotal = versions.reduce(
    (sum, entry) => sum + entry.downloadsTotal,
    0,
  );
  const downloadsWeekly = versions.reduce(
    (sum, entry) => sum + entry.downloadsWeekly,
    0,
  );

  const playgroundIncluded = hasPlayground(shownFileTree);

  return (
    <div
      lang={pinned?.contentLocale ?? agent.contentLocale}
      className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6"
    >
      <Link
        href="/agents"
        className="font-mono text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand-garnet)]"
      >
        {locale === 'es' ? '← Volver a agentes' : '← Back to agents'}
      </Link>

      <header className="mb-8 mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[var(--color-border-medium)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-text-secondary)]">
            v{shownVersion}
          </span>
          {isHistorical ? (
            <Link
              href={`/agents/${agent.slug}`}
              className="font-mono text-xs text-[var(--color-text-muted)] underline-offset-2 hover:underline"
            >
              {locale === 'es' ? 'Ver última' : 'View latest'} (v{agent.version}
              )
            </Link>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              latest
            </span>
          )}
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {downloadsWeekly.toLocaleString()} weekly ·{' '}
            {downloadsTotal.toLocaleString()} total downloads
          </span>
          {playgroundIncluded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
              <Play className="h-3 w-3" /> Demo included
            </span>
          )}
          <time
            dateTime={agent.updatedAt.toISOString()}
            className="font-mono text-xs text-[var(--color-text-muted)]"
          >
            {locale === 'es' ? 'Actualizado' : 'Updated'}{' '}
            {formatDate(agent.updatedAt, locale)}
          </time>
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {agent.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {agent.shortDescription}
        </p>
        {agent.repositoryUrl &&
          !agent.relatedLinks?.some(
            (link) => link.url === agent.repositoryUrl,
          ) && (
            <a
              href={agent.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
            >
              {locale === 'es'
                ? 'Repositorio del proyecto ↗'
                : 'Project repository ↗'}
            </a>
          )}
        {agent.authorName && (
          <p className="mt-3 font-mono text-xs text-[var(--color-text-muted)]">
            {locale === 'es' ? 'Autoría:' : 'Author:'} {agent.authorName}
          </p>
        )}
      </header>
      <AvatarContentScene kind="agent" slug={agent.slug} />
      <ContentLanguage
        contentLocale={pinned?.contentLocale ?? agent.contentLocale}
      />
      <RelatedLinks links={agent.relatedLinks} />

      <ContentCover
        title={agent.title}
        kind="agent"
        imageUrl={agent.headerImageUrl}
        className="mb-8 h-44 w-full rounded-[12px] sm:h-56"
      />

      {agent.isLocked ? (
        <PremiumGate
          priceCents={agent.priceCents}
          currency={agent.currency}
          previewContent={agent.previewContent}
        />
      ) : (
        <>
          {shownReadme && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                {locale === 'es' ? 'Acerca del agente' : 'About'}
              </h2>
              <MarkdownContent content={shownReadme} />
            </section>
          )}
          <details
            open={!agent.repositoryUrl}
            className="mt-8 rounded-xl border border-[var(--color-border-soft)] p-4"
          >
            <summary className="mb-4 cursor-pointer font-semibold">
              {locale === 'es' ? 'Ficheros y descargas' : 'Files & downloads'}
            </summary>
            <div className="mb-4 flex justify-end">
              <AgentDownloadButton
                locale={locale}
                contentLocale={pinned?.contentLocale ?? agent.contentLocale}
                slug={agent.slug}
                version={shownVersion}
                fileTree={shownFileTree}
                readmeContent={shownReadme}
              />
            </div>
            <AgentWorkbench
              fileTree={shownFileTree}
              meta={{
                slug: agent.slug,
                version: shownVersion,
                updatedAt: formatDate(agent.updatedAt),
                fileCount: countFiles(shownFileTree),
                hasPlayground: playgroundIncluded,
              }}
            />
          </details>
        </>
      )}

      <VersionHistory
        locale={locale}
        versions={versions}
        basePath={`/agents/${agent.slug}`}
        currentVersion={shownVersion}
      />
      <div className="mt-8 flex justify-end border-t border-[var(--color-border-soft)] pt-3">
        <ContributeLink kind="agent" />
      </div>
    </div>
  );
}
