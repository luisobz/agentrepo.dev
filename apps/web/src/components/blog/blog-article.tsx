import { blogReadingSummary } from './reading-summary';
import {
  ContentCover,
  LazyRead,
  MarkdownContent,
  RelatedLinks,
} from '@agentrepo/ui';
import Link from '../localized-link';
import { ContentLanguage } from '../content-language';
import type { BlogPost } from '../../lib/blog';
import { formatDate } from '../../lib/public-content';

export function BlogArticle({
  post,
  locale,
}: {
  post: BlogPost;
  locale: 'es' | 'en';
}) {
  const reading = blogReadingSummary(post);
  return (
    <article
      lang={post.contentLocale}
      className="mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6"
    >
      <Link
        href="/blog"
        className="font-mono text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand-garnet)]"
      >
        {locale === 'es' ? '← Volver al blog' : '← Back to blog'}
      </Link>

      <header className="mb-4 mt-8">
        <time
          dateTime={post.createdAt.toISOString()}
          className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
        >
          {formatDate(post.createdAt, locale)}
        </time>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        {post.authorName && (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {locale === 'es' ? 'Autoría:' : 'Author:'} {post.authorName}
          </p>
        )}
      </header>
      <LazyRead
        {...reading}
        locale={locale}
        contentLocale={post.contentLocale}
      />
      <ContentLanguage contentLocale={post.contentLocale} />
      <RelatedLinks links={post.relatedLinks} />

      {post.headerImageUrl && (
        <ContentCover
          title={post.title}
          kind="blog"
          imageUrl={post.headerImageUrl}
          className="mb-10 h-48 w-full rounded-[12px] sm:h-64"
        />
      )}

      <MarkdownContent content={post.content} className="prose-lg" />
    </article>
  );
}
