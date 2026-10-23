import { BlogArticle } from '../../../components/blog/blog-article';
import { getServerLocale } from '../../../lib/i18n/server';
import { SHARE_IMAGE } from '../../../lib/seo/public-site';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublishedPostBySlug } from '../../../lib/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function buildDescription(excerpt: string | null, content: string): string {
  if (excerpt) {
    return excerpt;
  }
  const plain = content
    .replace(/[#*_`>[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      images: [SHARE_IMAGE],
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
  const locale = await getServerLocale();
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return <BlogArticle post={post} locale={locale} />;
}
