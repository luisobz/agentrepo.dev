import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarkdownContent } from '../../../components/markdown/markdown-content';
import { getPublishedPostBySlug } from '../../../lib/blog';
import { formatDate } from '../../../lib/public-content';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function buildDescription(excerpt: string | null, content: string): string {
  if (excerpt) {
    return excerpt;
  }
  const plain = content.replace(/[#*_`>[\]()]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: 'Post not found | AgentRepo.dev' };
  }

  const description = buildDescription(post.excerpt, post.content);
  return {
    title: `${post.title} | AgentRepo.dev Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      url: `/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
      <Link
        href="/blog"
        className="font-mono text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand-garnet)]"
      >
        ← Back to blog
      </Link>

      <header className="mb-10 mt-8">
        <time
          dateTime={post.createdAt.toISOString()}
          className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
        >
          {formatDate(post.createdAt)}
        </time>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
            {post.excerpt}
          </p>
        )}
      </header>

      <MarkdownContent content={post.content} className="prose-lg" />
    </article>
  );
}
