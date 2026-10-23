import { TRPCClientError } from '@trpc/client';
import { beforeEach, expect, it, vi } from 'vitest';
import { getBlogReviewToken, privateBlogReview } from './blog-review';

const { client } = vi.hoisted(() => ({ client: vi.fn() }));
vi.mock('./supabase/server', () => ({ getSupabaseServerClient: client }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('PRIVATE_404');
  },
}));
beforeEach(() => vi.resetAllMocks());

it('does not read a draft without a session', async () => {
  client.mockResolvedValue(null);
  await expect(getBlogReviewToken()).rejects.toThrow('PRIVATE_404');
});

it('only extracts a credential; the backend operation still has to verify it', async () => {
  client.mockResolvedValue({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'untrusted-cookie-credential' } },
      }),
    },
  });
  expect(await getBlogReviewToken()).toBe('untrusted-cookie-credential');
});

it('hides an unauthorized preview but does not disguise an availability failure as a missing post', async () => {
  const denied = new TRPCClientError('denied', {
    result: {
      error: {
        message: 'denied',
        code: -32001,
        data: { code: 'UNAUTHORIZED' },
      },
    },
  });
  await expect(privateBlogReview(() => Promise.reject(denied))).rejects.toThrow(
    'PRIVATE_404',
  );
  await expect(
    privateBlogReview(() => Promise.reject(new TypeError('offline'))),
  ).rejects.toThrow('offline');
});
