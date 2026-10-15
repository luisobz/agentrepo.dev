import type { TRPCContext } from '../trpc';
import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { creatorRouter } from './creator';

function context(creatorUserId: string | null) {
  const createSkill = vi.fn(async (input: unknown) => input);
  const createBlog = vi.fn(async (input: unknown) => input);
  const createAgent = vi.fn(async (input: unknown) => input);
  const ctx = {
    isAdmin: false,
    creatorUserId,
    clientIp: crypto.randomUUID(),
    catalog: {
      blogPosts: { create: { execute: createBlog } },
      skills: { create: { execute: createSkill } },
      agents: { create: { execute: createAgent } },
    },
  } as unknown as TRPCContext;
  return {
    caller: creatorRouter.createCaller(ctx),
    createSkill,
    createAgent,
    createBlog,
  };
}

describe('creator submissions', () => {
  it('requires a verified creator identity', async () => {
    const { caller, createSkill } = context(null);
    await expect(
      caller.submitSkill({
        slug: 'my-skill',
        title: 'My skill',
        description: '',
        content: '# Hello',
        type: 'prompt',
      }),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    } satisfies Partial<TRPCError>);
    expect(createSkill).not.toHaveBeenCalled();
  });

  it('assigns the authenticated author and keeps a skill unpublished', async () => {
    const { caller, createSkill } = context('user-123');
    await caller.submitSkill({
      slug: 'my-skill',
      title: 'My skill',
      description: '',
      content: '# Hello',
      type: 'prompt',
    });
    expect(createSkill).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'user-123',
        isPublished: false,
        isPremium: false,
      }),
    );
  });

  it('assigns the authenticated author and keeps an agent unpublished', async () => {
    const { caller, createAgent } = context('user-123');
    await caller.submitAgent({
      slug: 'my-agent',
      title: 'My agent',
      shortDescription: 'Helpful agent',
      readmeContent: '# Hello',
    });
    expect(createAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'user-123',
        isPublished: false,
        isPremium: false,
        fileTree: [{ name: 'README.md', type: 'file', content: '# Hello' }],
      }),
    );
  });
});

describe('creator blog moderation', () => {
  const article = {
    slug: 'new-article',
    title: 'My article',
    excerpt: 'Overview',
    content: '# Article',
  };
  it('requires a verified author for articles too', async () => {
    const { caller, createBlog } = context(null);
    await expect(caller.submitBlog(article)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
    expect(createBlog).not.toHaveBeenCalled();
  });
  it('ignores client attempts to publish or impersonate another author', async () => {
    const { caller, createBlog } = context('author-one');
    const payload = {
      ...article,
      isPublished: true,
      authorId: 'another-author',
    };
    await caller.submitBlog(payload);
    expect(createBlog).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: 'author-one', isPublished: false }),
    );
  });
});

describe('creator source files', () => {
  const agent = {
    slug: 'source-agent',
    title: 'Source agent',
    shortDescription: 'Agent sources',
    readmeContent: '# Reviewed',
  };
  it('stores multiple source files under moderation and keeps README edits', async () => {
    const { caller, createAgent } = context('author-one');
    await caller.submitAgent({
      ...agent,
      files: [
        { path: 'src/main.py', content: 'print(1)' },
        { path: 'README.md', content: 'old' },
      ],
    });
    expect(createAgent.mock.calls[0][0]).not.toHaveProperty('files');
    expect(createAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'author-one',
        isPublished: false,
        fileTree: [
          { name: 'README.md', type: 'file', content: '# Reviewed' },
          {
            name: 'src',
            type: 'directory',
            children: [{ name: 'main.py', type: 'file', content: 'print(1)' }],
          },
        ],
      }),
    );
  });
  it.each(['../evil.py', '/evil.py', '.env', 'nested.zip'])(
    'rejects direct API bypass for %s before saving',
    async (path) => {
      const { caller, createAgent } = context('author-one');
      await expect(
        caller.submitAgent({ ...agent, files: [{ path, content: 'data' }] }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(createAgent).not.toHaveBeenCalled();
    },
  );
});

it('limits draft creation by verified account across proxy IP changes', async () => {
  const user = crypto.randomUUID();
  const payload = {
    slug: 'limited-draft',
    title: 'Draft',
    readmeContent: '# Draft',
    shortDescription: 'A draft',
  };
  for (let i = 0; i < 10; i++) await context(user).caller.submitAgent(payload);
  const { caller, createAgent } = context(user);
  await expect(caller.submitAgent(payload)).rejects.toMatchObject({
    code: 'TOO_MANY_REQUESTS',
  });
  expect(createAgent).not.toHaveBeenCalled();
});
