import type { PrismaClient, Prisma } from '@prisma/client';
import { expect, it, vi } from 'vitest';
import { PrismaBlogPostRepository } from './prisma-blog-post.repository';

it('includes administrator-authored drafts without exposing published posts in the review list', async () => {
  const findMany = vi.fn(async () => []);
  const count = vi.fn(async () => 0);
  const repository = new PrismaBlogPostRepository({
    blogPost: { findMany, count },
  } as unknown as PrismaClient);
  await repository.list({ page: 1, pageSize: 20, unpublishedOnly: true });
  expect(findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { isPublished: false } }),
  );
  expect(count).toHaveBeenCalledWith({ where: { isPublished: false } });
});

it('preserves a stored summary on unrelated updates and clears it only explicitly', async () => {
  const summary = { summary: 'Stored', points: ['Point'] };
  const update = vi.fn(async (_args: Prisma.BlogPostUpdateArgs) => ({
    lazyRead: summary,
    translations: null,
    relatedLinks: [],
  }));
  const repository = new PrismaBlogPostRepository({
    blogPost: { update },
  } as unknown as PrismaClient);
  expect(
    (await repository.update('post', { title: 'New title' })).lazyRead,
  ).toEqual(summary);
  expect(update.mock.calls[0][0].data).not.toHaveProperty('lazyRead');
  await repository.update('post', { lazyRead: null });
  expect(update.mock.calls[1][0].data).toHaveProperty('lazyRead');
});
