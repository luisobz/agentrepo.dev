import type { TRPCContext } from '../trpc';
import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { creatorRouter } from './creator';

function context(creatorUserId: string | null) {
  const createSkill = vi.fn(async (input: unknown) => input);
  const createAgent = vi.fn(async (input: unknown) => input);
  const ctx = {
    isAdmin: false,
    creatorUserId,
    clientIp: crypto.randomUUID(),
    catalog: {
      skills: { create: { execute: createSkill } },
      agents: { create: { execute: createAgent } },
    },
  } as unknown as TRPCContext;
  return { caller: creatorRouter.createCaller(ctx), createSkill, createAgent };
}

describe('creator submissions', () => {
  it('requires a verified creator identity', async () => {
    const { caller, createSkill } = context(null);
    await expect(caller.submitSkill({ slug: 'my-skill', title: 'My skill', description: '', content: '# Hello', type: 'prompt' }))
      .rejects.toMatchObject({ code: 'UNAUTHORIZED' } satisfies Partial<TRPCError>);
    expect(createSkill).not.toHaveBeenCalled();
  });

  it('assigns the authenticated author and keeps a skill unpublished', async () => {
    const { caller, createSkill } = context('user-123');
    await caller.submitSkill({ slug: 'my-skill', title: 'My skill', description: '', content: '# Hello', type: 'prompt' });
    expect(createSkill).toHaveBeenCalledWith(expect.objectContaining({
      authorId: 'user-123', isPublished: false, isPremium: false,
    }));
  });

  it('assigns the authenticated author and keeps an agent unpublished', async () => {
    const { caller, createAgent } = context('user-123');
    await caller.submitAgent({ slug: 'my-agent', title: 'My agent', shortDescription: 'Helpful agent', readmeContent: '# Hello' });
    expect(createAgent).toHaveBeenCalledWith(expect.objectContaining({
      authorId: 'user-123', isPublished: false, isPremium: false,
      fileTree: [{ name: 'README.md', type: 'file', content: '# Hello' }],
    }));
  });
});
