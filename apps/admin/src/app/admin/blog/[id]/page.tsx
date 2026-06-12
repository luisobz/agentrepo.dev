'use client';

import { useParams } from 'next/navigation';
import { BlogPostForm } from '../../../../components/admin/blog/blog-post-form';
import { FormError } from '../../../../components/admin/form/form-error';
import { trpc } from '../../../../components/utils/trpc';

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = trpc.blogPosts.admin.byId.useQuery({ id });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit blog post</h1>
      {post.isLoading && (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      )}
      {post.error && <FormError message={post.error.message} />}
      {post.data && <BlogPostForm post={post.data} />}
    </div>
  );
}
