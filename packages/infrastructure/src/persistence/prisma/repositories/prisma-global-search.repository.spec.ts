import { expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaGlobalSearchRepository } from './prisma-global-search.repository';
it('returns the published skill version so search results can pin their destination', async () => {
  const query = vi
    .fn()
    .mockResolvedValueOnce([
      {
        id: 'skill-id',
        slug: 'writer',
        title: 'Writer',
        description: null,
        type: 'prompt',
        version: '1.2.3',
      },
    ])
    .mockResolvedValue([]);
  const repository = new PrismaGlobalSearchRepository({
    $queryRaw: query,
  } as unknown as PrismaClient);
  const hits = await repository.searchPublished({
    query: 'writer',
    limitPerType: 5,
  });
  expect(hits).toEqual([
    expect.objectContaining({
      type: 'skill',
      slug: 'writer',
      version: '1.2.3',
    }),
  ]);
  expect(query.mock.calls[0][0].strings.join('')).toContain(
    '"version" FROM "Skill"',
  );
});
