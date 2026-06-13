import Link from 'next/link';
import type { Metadata } from 'next';
import { ContentCover } from '@agentrepo/ui';
import { Play } from 'lucide-react';
import { getServerLocale, getServerT } from '../../lib/i18n/server';
import { formatPrice } from '../../lib/format-price';
import { formatDate } from '../../lib/public-content';
import { getPublishedAgents, hasPlayground } from '../../lib/agents';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agents | AgentRepo.dev',
  description:
    'AI agent definitions with full file trees, ready to explore and reuse.',
};

export default async function AgentsPage() {
  const [agents, locale, t] = await Promise.all([
    getPublishedAgents(),
    getServerLocale(),
    getServerT(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('agents.title')}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          {t('agents.subtitle')}
        </p>
      </header>

      {agents.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">{t('common.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.slug}`}
              className="group flex flex-col overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)] transition-all hover:-translate-y-[2px] hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-sm)]"
            >
              <ContentCover
                title={agent.title}
                kind="agent"
                imageUrl={agent.headerImageUrl}
                className="h-28 w-full"
              />
              <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  v{agent.version}
                </span>
                {hasPlayground(agent.fileTree) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
                    <Play className="h-3 w-3" /> {t('common.demoIncluded')}
                  </span>
                )}
                {agent.isPremium && agent.priceCents != null && (
                  <span className="rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
                    {t('premium.badge')} · {formatPrice(agent.priceCents, agent.currency, locale)}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand-garnet)]">
                {agent.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {agent.shortDescription}
              </p>
              <time
                dateTime={agent.updatedAt.toISOString()}
                className="mt-auto pt-4 font-mono text-xs text-[var(--color-text-muted)]"
              >
                {t('common.updated')} {formatDate(agent.updatedAt)}
              </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
