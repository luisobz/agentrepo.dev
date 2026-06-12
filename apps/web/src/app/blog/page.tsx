import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedPosts } from '../../lib/blog';
import { formatDate } from '../../lib/public-content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | AgentRepo.dev',
  description:
    'Articles on AI agents, clean coding and development workflows from AgentRepo.dev.',
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Blog
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Notes on AI agents, clean coding and development workflows.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">
          Nothing published yet. Come back soon.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-6 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-[2px] hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-sm)] sm:p-8"
            >
              <article>
                <time
                  dateTime={post.createdAt.toISOString()}
                  className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                >
                  {formatDate(post.createdAt)}
                </time>
                <h2 className="mt-2 text-xl font-semibold leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand-garnet)] sm:text-2xl">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-4 inline-block text-sm font-medium text-[var(--color-brand-garnet)]">
                  Read post →
                </span>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
