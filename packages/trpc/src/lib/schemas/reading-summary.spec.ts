import { expect, it } from 'vitest';
import { createBlogPostSchema, readingSummarySchema } from './catalog.schemas';

it('bounds summaries and supports optional or explicitly cleared blog summaries', () => {
  const post = { slug: 'post', title: 'Post', content: 'Body' };
  expect(createBlogPostSchema.safeParse(post).success).toBe(true);
  expect(
    createBlogPostSchema.safeParse({ ...post, lazyRead: null }).success,
  ).toBe(true);
  expect(readingSummarySchema.parse({ summary: ' Summary ' })).toEqual({
    summary: 'Summary',
    points: [],
  });
  for (const invalid of [
    { summary: ' ' },
    { summary: 'x'.repeat(1201) },
    { summary: 'Summary', points: ['x'.repeat(121)] },
    { summary: 'Summary', points: ['a', 'b', 'c', 'd'] },
    { summary: 'Summary', command: 'execute' },
  ])
    expect(readingSummarySchema.safeParse(invalid).success).toBe(false);
  expect(
    createBlogPostSchema.safeParse({
      ...post,
      translations: {
        en: {
          title: 'Post',
          content: 'Body',
          lazyRead: { summary: 'Short', points: ['Point'] },
        },
      },
    }).success,
  ).toBe(true);
});
