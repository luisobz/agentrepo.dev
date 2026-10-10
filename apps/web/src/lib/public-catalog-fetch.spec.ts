import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicCatalogFetch } from './public-catalog-fetch';

describe('public catalog cache boundary', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('caches anonymous catalog reads for thirty seconds', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    await publicCatalogFetch(
      'https://example.test/api/trpc/skills.list,agents.list',
      {},
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        cache: 'force-cache',
        next: { revalidate: 30, tags: ['public-catalog'] },
      }),
    );
  });

  it.each([
    ['skills.list', { headers: { authorization: 'Bearer private' } }],
    ['skills.list', { headers: { cookie: 'session=private' } }],
    ['skills.list', { method: 'POST' }],
    ['creator.mine', {}],
    ['skills.list,admin.skills.list', {}],
  ])(
    'never shares authenticated, private or mutation responses: %s',
    async (procedure, init) => {
      const fetch = vi.fn().mockResolvedValue(new Response('{}'));
      vi.stubGlobal('fetch', fetch);
      await publicCatalogFetch(
        `https://example.test/api/trpc/${procedure}`,
        init,
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ cache: 'no-store' }),
      );
    },
  );
});
