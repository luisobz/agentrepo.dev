import { expect, it, vi } from 'vitest';
import { appRouter } from './_app';
import type { TRPCContext } from '../trpc';
function setup(ip: string | null = '192.0.2.123') {
  const recordView = vi.fn().mockResolvedValue(undefined);
  const caller = appRouter.createCaller({
    clientIp: ip,
    popularity: {
      recordView,
      list: { execute: vi.fn().mockResolvedValue([]) },
    },
  } as unknown as TRPCContext);
  return { caller, recordView };
}
it('counts once per content/IP window and never accepts client counts or paths', async () => {
  const { caller, recordView } = setup();
  await caller.popularity.recordView({ kind: 'blog', slug: 'test-blog' });
  await caller.popularity.recordView({ kind: 'blog', slug: 'test-blog' });
  expect(recordView).toHaveBeenCalledTimes(1);
  expect(recordView).toHaveBeenCalledWith('blog', 'test-blog');
  await expect(
    caller.popularity.recordView({ kind: 'blog', slug: '../private' }),
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
});
it('does not persist a view without a client address', async () => {
  const { caller, recordView } = setup(null);
  await caller.popularity.recordView({ kind: 'skill', slug: 'writer' });
  expect(recordView).not.toHaveBeenCalled();
});
