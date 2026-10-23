'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getBlogReviewToken } from '../../../lib/blog-review';
import { serverTrpc } from '../../../lib/trpc-server';

export async function publishReviewedPost(
  id: string,
): Promise<{ error: boolean }> {
  const token = await getBlogReviewToken();
  let slug: string;
  try {
    const result = await serverTrpc.blogPosts.review.publish.mutate({
      token,
      id,
    });
    slug = result.slug;
  } catch {
    return { error: true };
  }
  revalidateTag('public-catalog', { expire: 0 });
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  redirect(`/blog/${slug}`);
}
