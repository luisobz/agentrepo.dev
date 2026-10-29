import Link from '../../../../components/localized-link';
import { BlogArticle } from '../../../../components/blog/blog-article';
import { PublishBlogButton } from '../../../../components/blog/publish-button';
import {
  getBlogReviewToken,
  privateBlogReview,
} from '../../../../lib/blog-review';
import { getServerLocale } from '../../../../lib/i18n/server';
import { serverTrpc } from '../../../../lib/trpc-server';

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await getBlogReviewToken();
  const { id } = await params;
  const locale = await getServerLocale();
  const post = await privateBlogReview(() =>
    serverTrpc.blogPosts.review.byId.mutate({ token, id, locale }),
  );
  return (
    <>
      <aside className="mx-auto mb-8 flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-5">
        <div>
          <p className="font-semibold">
            {locale === 'es' ? 'Vista previa privada' : 'Private preview'}
          </p>
          <Link href="/blog/review" className="mt-1 inline-block text-sm">
            {locale === 'es' ? '← Todos los borradores' : '← All drafts'}
          </Link>
        </div>
        {post.isPublished ? (
          <Link href={`/blog/${post.slug}`}>
            {locale === 'es'
              ? 'Ver artículo publicado'
              : 'View published article'}
          </Link>
        ) : (
          <PublishBlogButton id={post.id} locale={locale} />
        )}
      </aside>
      <BlogArticle post={post} locale={locale} />
    </>
  );
}
