import Link from 'next/link';
import { ContentCover, TypeChip, type ContentCoverKind } from '@agentrepo/ui';
import { Inbox } from 'lucide-react';
import { getServerLocale, getServerT } from '../../lib/i18n/server';
import { formatDate } from '../../lib/public-content';
import { formatPrice } from '../../lib/format-price';
import { serverTrpc } from '../../lib/trpc-server';

interface LatestEntry {
  id: string;
  kind: ContentCoverKind;
  title: string;
  description: string | null;
  href: string;
  createdAt: Date;
  imageUrl: string | null;
  skillType?: 'prompt' | 'system' | 'config' | 'template';
  premiumPrice?: string;
}

const FEED_SIZE = 6;

async function fetchLatest(locale: Awaited<ReturnType<typeof getServerLocale>>): Promise<LatestEntry[]> {
  const [skills, agents, posts] = await Promise.all([
    serverTrpc.skills.list.query({ page: 1, pageSize: FEED_SIZE }),
    serverTrpc.agents.list.query({ page: 1, pageSize: FEED_SIZE }),
    serverTrpc.blog.getPosts.query({ page: 1, pageSize: FEED_SIZE }),
  ]);

  const entries: LatestEntry[] = [
    ...skills.items.map((skill): LatestEntry => ({
      id: skill.id,
      kind: 'skill',
      title: skill.title,
      description: skill.description,
      href: `/skills/${skill.slug}`,
      createdAt: skill.createdAt,
      imageUrl: skill.headerImageUrl,
      skillType: skill.type,
      premiumPrice:
        skill.isPremium && skill.priceCents != null
          ? formatPrice(skill.priceCents, skill.currency, locale)
          : undefined,
    })),
    ...agents.items.map((agent): LatestEntry => ({
      id: agent.id,
      kind: 'agent',
      title: agent.title,
      description: agent.shortDescription,
      href: `/agents/${agent.slug}`,
      createdAt: agent.createdAt,
      imageUrl: agent.headerImageUrl,
      premiumPrice:
        agent.isPremium && agent.priceCents != null
          ? formatPrice(agent.priceCents, agent.currency, locale)
          : undefined,
    })),
    ...posts.items.map((post): LatestEntry => ({
      id: post.id,
      kind: 'blog',
      title: post.title,
      description: post.excerpt,
      href: `/blog/${post.slug}`,
      createdAt: post.createdAt,
      imageUrl: post.headerImageUrl,
    })),
  ];

  return entries
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, FEED_SIZE);
}

export async function LatestSection() {
  const locale = await getServerLocale();
  const t = await getServerT();
  const entries = await fetchLatest(locale);

  return (
    <section aria-labelledby="latest-heading" className="pb-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 id="latest-heading" className="text-2xl font-semibold tracking-tight">
          {t('latest.title')}
        </h2>
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          {t('latest.tagline')}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-[var(--color-border-medium)] bg-[var(--color-bg-warm-white)]/60 px-6 py-16 text-center">
          <Inbox className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="text-lg font-semibold">{t('latest.empty.title')}</p>
          <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
            {t('latest.empty.body')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={`${entry.kind}-${entry.id}`}
              href={entry.href}
              className="group flex flex-col overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)] transition-all hover:-translate-y-[2px] hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-sm)]"
            >
              <ContentCover
                title={entry.title}
                kind={entry.kind}
                imageUrl={entry.imageUrl}
                className="h-28 w-full"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  {entry.skillType ? (
                    <TypeChip type={entry.skillType} />
                  ) : (
                    <span className="rounded-full border border-[var(--color-border-medium)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {entry.kind}
                    </span>
                  )}
                  {entry.premiumPrice && (
                    <span className="rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
                      {t('premium.badge')} · {entry.premiumPrice}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug transition-colors group-hover:text-[var(--color-brand-garnet)]">
                  {entry.title}
                </h3>
                {entry.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {entry.description}
                  </p>
                )}
                <time
                  dateTime={entry.createdAt.toISOString()}
                  className="mt-auto pt-3 font-mono text-xs text-[var(--color-text-muted)]"
                >
                  {formatDate(entry.createdAt)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
