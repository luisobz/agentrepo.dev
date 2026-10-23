import { TRPCClientError } from '@trpc/client';
import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from './supabase/server';

/** Read the token only as a credential to submit to the backend's verified
 * identity/role check. Never authorize from getSession's cookie-derived claims. */
export async function getBlogReviewToken(): Promise<string> {
  const client = await getSupabaseServerClient();
  const session = client ? (await client.auth.getSession()).data.session : null;
  if (!session) notFound();
  return session.access_token;
}

export async function privateBlogReview<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof TRPCClientError &&
      ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'BAD_REQUEST'].includes(
        error.data?.code,
      )
    )
      notFound();
    throw error;
  }
}
