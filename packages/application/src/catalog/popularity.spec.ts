import { expect, it, vi } from 'vitest';
import { ListTrendingContent } from './popularity';

it('requires evidence, ranks recent activity, and limits the public feed', async () => {
  const recent = vi.fn().mockResolvedValue([
    { kind: 'blog', slug: 'quiet', views: 2, downloads: 0 },
    { kind: 'blog', slug: 'popular', views: 20, downloads: 0 },
    { kind: 'skill', slug: 'downloaded', views: 3, downloads: 10 },
  ]);
  const list = new ListTrendingContent({ recent, recordView: vi.fn() });
  const result = await list.execute();
  expect(result.map((row) => row.slug)).toEqual(['downloaded', 'popular']);
  expect(result[0].score).toBe(33);
  expect(recent).toHaveBeenCalledWith(expect.any(Date));
});
