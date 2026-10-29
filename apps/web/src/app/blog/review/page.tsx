import Link from '../../../components/localized-link';
import {
  getBlogReviewToken,
  privateBlogReview,
} from '../../../lib/blog-review';
import { getServerLocale } from '../../../lib/i18n/server';
import { serverTrpc } from '../../../lib/trpc-server';

export default async function BlogReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = await getBlogReviewToken();
  const locale = await getServerLocale();
  const query = await searchParams;
  const page = /^\d{1,6}$/.test(query.page ?? '')
    ? Math.max(1, Number(query.page))
    : 1;
  const pageSize = 20;
  const posts = await privateBlogReview(() =>
    serverTrpc.blogPosts.review.list.mutate({
      token,
      locale,
      page,
      pageSize,
    }),
  );
  const drafts = posts.items.filter((post) => !post.isPublished);
  return (
    <section className="mx-auto max-w-3xl px-4 pb-24">
      <Link href="/blog" className="text-sm">
        {locale === 'es' ? '← Volver al blog' : '← Back to blog'}
      </Link>
      <h1 className="mb-3 mt-8 text-3xl font-semibold">
        {locale === 'es' ? 'Revisar borradores' : 'Review drafts'}
      </h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        {locale === 'es'
          ? 'Vista privada de administrador. Revisa cada artículo antes de publicarlo.'
          : 'Private administrator view. Review each article before publishing.'}
      </p>
      {drafts.length === 0 && (
        <p>
          {locale === 'es'
            ? 'No hay borradores pendientes.'
            : 'No drafts awaiting review.'}
        </p>
      )}
      <div className="flex flex-col gap-4">
        {drafts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/review/${post.id}`}
            className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-6"
          >
            <h2 className="text-xl font-semibold">{post.title}</h2>
            {post.excerpt && (
              <p className="mt-2 text-[var(--color-text-secondary)]">
                {post.excerpt}
              </p>
            )}
            <span className="mt-4 block text-sm text-[var(--color-brand-garnet)]">
              {locale === 'es' ? 'Abrir vista previa →' : 'Open preview →'}
            </span>
          </Link>
        ))}
      </div>
      <nav
        aria-label={locale === 'es' ? 'Páginas de borradores' : 'Draft pages'}
        className="mt-8 flex justify-between gap-4 text-sm"
      >
        {page > 1 && (
          <Link href={`/blog/review?page=${page - 1}`}>
            {locale === 'es' ? '← Anterior' : '← Previous'}
          </Link>
        )}
        {page * pageSize < posts.total && (
          <Link href={`/blog/review?page=${page + 1}`}>
            {locale === 'es' ? 'Siguiente →' : 'Next →'}
          </Link>
        )}
      </nav>
    </section>
  );
}
