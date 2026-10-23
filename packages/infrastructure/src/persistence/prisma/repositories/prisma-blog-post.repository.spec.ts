import type { PrismaClient } from '@prisma/client';
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
