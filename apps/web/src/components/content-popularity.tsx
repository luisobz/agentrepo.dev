import { getTrendingContent } from '../lib/trending';
import { TrendingIndicator } from './trending-indicator';
import { ContentView } from './content-view';
export async function ContentPopularity({
  kind,
  slug,
  locale,
}: {
  kind: 'skill' | 'agent' | 'blog';
  slug: string;
  locale: 'es' | 'en';
}) {
  const trends = await getTrendingContent();
  return (
    <>
      <ContentView kind={kind} slug={slug} />
      {trends.some((row) => row.kind === kind && row.slug === slug) && (
        <TrendingIndicator locale={locale} />
      )}
    </>
  );
}
