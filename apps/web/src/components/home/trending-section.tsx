import { formatPrice } from '../../lib/format-price';
import { getServerLocale } from '../../lib/i18n/server';
import { getTrendingContent } from '../../lib/trending';
import { serverTrpc } from '../../lib/trpc-server';
import { TrendingIndicator } from '../trending-indicator';
import { ContentFeedCard, type LatestEntry } from './latest-section';

export async function TrendingSection({
  kind,
}: {
  kind?: 'skill' | 'agent' | 'blog';
}) {
  const locale = await getServerLocale();
  const signals = (await getTrendingContent()).filter(
    (row) => !kind || row.kind === kind,
  );
  const entries = await Promise.all(
    signals.map(async (row): Promise<LatestEntry | null> => {
      try {
        const args = { slug: row.slug, locale };
        if (row.kind === 'skill') {
          const item = await serverTrpc.skills.bySlug.query(args);
          return {
            ...item,
            kind: 'skill',
            premiumPrice:
              item.isPremium && item.priceCents != null
                ? formatPrice(item.priceCents, item.currency, locale)
                : undefined,
            href: `/skills/${item.slug}/${item.version}`,
            imageUrl: item.headerImageUrl,
            skillType: item.type,
          };
        }
        if (row.kind === 'agent') {
          const item = await serverTrpc.agents.bySlug.query(args);
          return {
            ...item,
            description: item.shortDescription,
            kind: 'agent',
            premiumPrice:
              item.isPremium && item.priceCents != null
                ? formatPrice(item.priceCents, item.currency, locale)
                : undefined,
            href: `/agents/${item.slug}`,
            imageUrl: item.headerImageUrl,
          };
        }
        const item = await serverTrpc.blog.getPostBySlug.query(args);
        return {
          ...item,
          description: item.excerpt,
          kind: 'blog',
          href: `/blog/${item.slug}`,
          imageUrl: item.headerImageUrl,
        };
      } catch {
        return null;
      } // A removed entry must not break the catalogue.
    }),
  );
  return (
    <section
      id={kind ? `${kind}-trending` : 'trending'}
      aria-labelledby={kind ? `${kind}-trending-heading` : 'trending-heading'}
      className="my-8 border-t border-[var(--color-border-soft)] pt-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2
          id={kind ? `${kind}-trending-heading` : 'trending-heading'}
          className="text-2xl font-semibold"
        >
          {locale === 'es' ? 'Tendencias' : 'Trending'}
        </h2>
        <TrendingIndicator locale={locale} />
      </div>
      <p className="mb-5 max-w-2xl text-sm text-[var(--color-text-secondary)]">
        {locale === 'es'
          ? 'Actividad de los últimos siete días: lecturas y descargas registradas.'
          : 'Activity over the last seven days: recorded reads and downloads.'}
      </p>
      {entries.some(Boolean) ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(
            (entry) =>
              entry && (
                <ContentFeedCard
                  key={`${entry.kind}:${entry.id}`}
                  entry={entry}
                  premiumLabel="Premium"
                />
              ),
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === 'es'
            ? 'Todavía no hay actividad suficiente para destacar contenido.'
            : 'There is not enough activity to highlight content yet.'}
        </p>
      )}
      <details className="mt-4 text-xs text-[var(--color-text-muted)]">
        <summary className="cursor-pointer">
          {locale === 'es' ? 'Cómo se calcula' : 'How it is calculated'}
        </summary>
        <p className="mt-2">
          {locale === 'es'
            ? 'Una lectura suma un punto y una descarga, tres. Se requieren al menos tres acciones en siete días. Son señales de interés, no personas únicas ni una medida de calidad.'
            : 'A read adds one point and a download adds three. At least three actions in seven days are required. These are interest signals, not unique people or a quality rating.'}
        </p>
      </details>
    </section>
  );
}
