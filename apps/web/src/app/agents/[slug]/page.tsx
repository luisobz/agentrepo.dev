import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentCover } from '@agentrepo/ui';
import { Play } from 'lucide-react';
import { PremiumGate } from '../../../components/premium/premium-gate';
import { AgentWorkbench } from '../../../components/agents/workbench/agent-workbench';
import { MarkdownContent } from '@agentrepo/ui';
import {
  countFiles,
  getPublishedAgentBySlug,
  hasPlayground,
} from '../../../lib/agents';
import { formatDate } from '../../../lib/public-content';

export const dynamic = 'force-dynamic';

interface AgentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getPublishedAgentBySlug(slug);
  if (!agent) {
    return { title: 'Agent not found | AgentRepo.dev' };
  }

  return {
    title: `${agent.title} | AgentRepo.dev Agents`,
    description: agent.shortDescription,
    openGraph: {
      title: agent.title,
      description: agent.shortDescription,
      type: 'article',
      url: `/agents/${agent.slug}`,
    },
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { slug } = await params;
  const agent = await getPublishedAgentBySlug(slug);
  if (!agent) {
    notFound();
  }

  const playgroundIncluded = hasPlayground(agent.fileTree);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <Link
        href="/agents"
        className="font-mono text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand-garnet)]"
      >
        ← Back to agents
      </Link>

      <header className="mb-8 mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[var(--color-border-medium)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-text-secondary)]">
            v{agent.version}
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
            Updated {formatDate(agent.updatedAt)}
          </time>
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {agent.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {agent.shortDescription}
        </p>
      </header>

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
          <AgentWorkbench
            fileTree={agent.fileTree}
            meta={{
              slug: agent.slug,
              version: agent.version,
              updatedAt: formatDate(agent.updatedAt),
              fileCount: countFiles(agent.fileTree),
              hasPlayground: playgroundIncluded,
            }}
          />

          {agent.readmeContent && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold tracking-tight">About</h2>
              <MarkdownContent content={agent.readmeContent} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
