import { describe, expect, it, vi } from 'vitest';
import type { TRPCContext } from '../trpc';
import { appRouter } from './_app';

const id = '11111111-1111-4111-8111-111111111111';

function setup(allowed: boolean) {
  const post = {
    id,
    slug: 'private-draft',
    title: 'Borrador',
    content: 'Privado',
    excerpt: null,
    isPublished: false,
    sourceLocale: 'es',
    translations: { en: { title: 'Draft', content: 'Private' } },
  };
  const checkAccess = vi.fn(async () => allowed);
  const get = vi.fn(async () => post);
  const list = vi.fn(async () => ({ items: [post], total: 1 }));
  const update = vi.fn(async () => ({ ...post, isPublished: true }));
  const caller = appRouter.createCaller({
    isAdmin: false,
    clientIp: '127.0.0.1',
    adminAuth: { checkAccess: { execute: checkAccess } },
    catalog: {
      blogPosts: {
        getById: { execute: get },
        list: { execute: list },
        update: { execute: update },
      },
    },
  } as unknown as TRPCContext);
  return { caller, checkAccess, get, list, update };
}

describe('web administrator blog review', () => {
  it('rejects every operation before reading or publishing drafts without a verified administrator', async () => {
    const { caller, get, list, update } = setup(false);
    await expect(
      caller.blogPosts.review.list({ token: 'untrusted' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    await expect(
      caller.blogPosts.review.byId({ token: 'untrusted', id }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    await expect(
      caller.blogPosts.review.publish({ token: 'untrusted', id }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(get).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('localizes a private preview without leaking other translation bodies', async () => {
    const { caller, checkAccess } = setup(true);
    const post = await caller.blogPosts.review.byId({
      token: 'verified',
      id,
      locale: 'en',
    });
    expect(checkAccess).toHaveBeenCalledWith('verified');
    expect(post).toMatchObject({
      title: 'Draft',
      content: 'Private',
      isPublished: false,
    });
    expect(post).not.toHaveProperty('translations');
  });

  it('returns private editorial summaries rather than complete bodies', async () => {
    const { caller, list } = setup(true);
    const page = await caller.blogPosts.review.list({
      token: 'verified',
      locale: 'es',
    });
    expect(page.items[0]).not.toHaveProperty('content');
    expect(page.items[0]).not.toHaveProperty('translations');
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ unpublishedOnly: true }),
    );
  });

  it('publishes only the selected post with a fresh role check', async () => {
    const { caller, checkAccess, update } = setup(true);
    await caller.blogPosts.review.publish({ token: 'verified', id });
    expect(checkAccess).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({ id, data: { isPublished: true } });
  });
});
