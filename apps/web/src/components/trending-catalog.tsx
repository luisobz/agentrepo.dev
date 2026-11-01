import { getServerLocale } from '../lib/i18n/server';
import { getTrendingContent } from '../lib/trending';
import { TrendingIndicator } from './trending-indicator';
import Link from './localized-link';
export async function TrendingCatalog({
  kind,
}: {
  kind: 'skill' | 'agent' | 'blog';
}) {
  const signals = (await getTrendingContent()).filter(
    (row) => row.kind === kind,
  );
  if (!signals.length) return null;
  const locale = await getServerLocale();
  return (
    <aside
      className="mb-5 flex flex-wrap items-center gap-x-3"
      aria-label={locale === 'es' ? 'Tendencias' : 'Trending'}
    >
      <TrendingIndicator locale={locale} />
      <Link href="/#trending" className="text-sm underline underline-offset-4">
        {locale === 'es'
          ? 'Ver el contenido destacado'
          : 'Explore trending content'}
      </Link>
    </aside>
  );
}
