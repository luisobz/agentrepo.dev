import type { CatalogUseCases, Paginated } from '@agentrepo/application';
import {
  EntityNotFoundError,
  SlugAlreadyInUseError,
  type SearchHit,
} from '@agentrepo/domain';
import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { TRPCContext } from '../trpc';
import { appRouter } from './_app';

const emptyPage: Paginated<never> = { items: [], total: 0, page: 1, pageSize: 20 };

interface StubUseCase {
  execute: ReturnType<typeof vi.fn>;
}

function stubUseCase(result: unknown): StubUseCase {
  return {
    execute: vi.fn(() => {
      if (result instanceof Error) {
        return Promise.reject(result);
      }
      return Promise.resolve(result);
    }),
  };
}

function buildCatalogStub(
  overrides?: Partial<Record<'create', StubUseCase>>
): CatalogUseCases {
  const contentUseCases = () => ({
    list: stubUseCase(emptyPage),
    getById: stubUseCase(new EntityNotFoundError('Entity', 'unknown')),
    getPublishedBySlug: stubUseCase(new EntityNotFoundError('Entity', 'unknown')),
    create: stubUseCase(emptyPage),
    update: stubUseCase(emptyPage),
    remove: stubUseCase(undefined),
    ...overrides,
  });

  return {
    skills: { ...contentUseCases(), searchPublished: stubUseCase(emptyPage) },
    agents: contentUseCases(),
    blogPosts: contentUseCases(),
  } as unknown as CatalogUseCases;
}

function buildContext(options?: {
  isAdmin?: boolean;
  catalog?: CatalogUseCases;
  globalSearch?: StubUseCase;
}): TRPCContext {
  return {
    isAdmin: options?.isAdmin ?? false,
    catalog: options?.catalog ?? buildCatalogStub(),
    globalSearch: (options?.globalSearch ??
      stubUseCase([])) as unknown as TRPCContext['globalSearch'],
  };
}

function createCaller(options?: Parameters<typeof buildContext>[0]) {
  return appRouter.createCaller(buildContext(options));
}

async function expectTRPCCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toSatisfy(
    (error) => error instanceof TRPCError && error.code === code
  );
}

describe('admin guard', () => {
  it('rejects admin procedures without an admin session', async () => {
    const caller = createCaller({ isAdmin: false });

    await expectTRPCCode(
      caller.skills.admin.list({ page: 1, pageSize: 10 }),
      'UNAUTHORIZED'
    );
    await expectTRPCCode(
      caller.blogPosts.admin.delete({ id: crypto.randomUUID() }),
      'UNAUTHORIZED'
    );
  });

  it('allows admin procedures with an admin session', async () => {
    const catalog = buildCatalogStub();
    const caller = createCaller({ isAdmin: true, catalog });

    await expect(caller.skills.admin.list({})).resolves.toEqual(emptyPage);
    expect(catalog.skills.list.execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
  });

  it('keeps public procedures open', async () => {
    const catalog = buildCatalogStub();
    const caller = createCaller({ isAdmin: false, catalog });

    await expect(caller.skills.list({})).resolves.toEqual(emptyPage);
    expect(catalog.skills.list.execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      publishedOnly: true,
    });
  });
});

describe('input validation', () => {
  const validSkill = {
    slug: 'my-skill',
    title: 'My Skill',
    content: '# Hello',
    type: 'prompt' as const,
  };

  it('rejects malformed slugs', async () => {
    const caller = createCaller({ isAdmin: true });

    await expectTRPCCode(
      caller.skills.admin.create({ ...validSkill, slug: 'Not A Slug!' }),
      'BAD_REQUEST'
    );
  });

  it('applies defaults before reaching the use case', async () => {
    const catalog = buildCatalogStub();
    const caller = createCaller({ isAdmin: true, catalog });

    await caller.skills.admin.create(validSkill);

    expect(catalog.skills.create.execute).toHaveBeenCalledWith({
      ...validSkill,
      description: null,
      isPublished: false,
    });
  });

  it('accepts a valid nested fileTree', async () => {
    const catalog = buildCatalogStub();
    const caller = createCaller({ isAdmin: true, catalog });

    await caller.agents.admin.create({
      slug: 'my-agent',
      title: 'My Agent',
      shortDescription: 'Does things',
      fileTree: [
        {
          name: 'src',
          type: 'directory',
          children: [{ name: 'index.ts', type: 'file', content: 'export {}' }],
        },
      ],
    });

    expect(catalog.agents.create.execute).toHaveBeenCalled();
  });

  it('rejects a fileTree with unknown node types', async () => {
    const caller = createCaller({ isAdmin: true });

    await expectTRPCCode(
      caller.agents.admin.create({
        slug: 'my-agent',
        title: 'My Agent',
        shortDescription: 'Does things',
        fileTree: [
          { name: 'weird', type: 'symlink' } as never,
        ],
      }),
      'BAD_REQUEST'
    );
  });

  it('rejects a directory node without children', async () => {
    const caller = createCaller({ isAdmin: true });

    await expectTRPCCode(
      caller.agents.admin.create({
        slug: 'my-agent',
        title: 'My Agent',
        shortDescription: 'Does things',
        fileTree: [{ name: 'src', type: 'directory' } as never],
      }),
      'BAD_REQUEST'
    );
  });
});

describe('public blog reading API', () => {
  it('lists only published posts ordered by publication date', async () => {
    const catalog = buildCatalogStub();
    const caller = createCaller({ isAdmin: false, catalog });

    await expect(caller.blog.getPosts({})).resolves.toEqual(emptyPage);
    expect(catalog.blogPosts.list.execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      publishedOnly: true,
      orderBy: 'createdAt',
    });
  });

  it('maps unknown slugs to NOT_FOUND', async () => {
    const caller = createCaller({ isAdmin: false });

    await expectTRPCCode(
      caller.blog.getPostBySlug({ slug: 'missing-post' }),
      'NOT_FOUND'
    );
  });

  it('rejects malformed slugs', async () => {
    const caller = createCaller({ isAdmin: false });

    await expectTRPCCode(
      caller.blog.getPostBySlug({ slug: 'Not Valid!' }),
      'BAD_REQUEST'
    );
  });
});

describe('global search', () => {
  const hit: SearchHit = {
    id: 'id-1',
    slug: 'review-skill',
    title: 'Review Skill',
    description: 'Reviews code',
    type: 'skill',
    badge: 'prompt',
  };

  it('returns hits from the search use case with the default per-type limit', async () => {
    const globalSearch = stubUseCase([hit]);
    const caller = createCaller({ globalSearch });

    await expect(caller.search.global({ query: 'review' })).resolves.toEqual([
      hit,
    ]);
    expect(globalSearch.execute).toHaveBeenCalledWith({
      query: 'review',
      limitPerType: 5,
    });
  });

  it('short-circuits queries below the minimum length', async () => {
    const globalSearch = stubUseCase([hit]);
    const caller = createCaller({ globalSearch });

    await expect(caller.search.global({ query: ' a ' })).resolves.toEqual([]);
    expect(globalSearch.execute).not.toHaveBeenCalled();
  });
});

describe('domain error mapping', () => {
  it('maps EntityNotFoundError to NOT_FOUND', async () => {
    const caller = createCaller({ isAdmin: true });

    await expectTRPCCode(
      caller.skills.admin.byId({ id: crypto.randomUUID() }),
      'NOT_FOUND'
    );
  });

  it('maps SlugAlreadyInUseError to CONFLICT', async () => {
    const catalog = buildCatalogStub({
      create: stubUseCase(new SlugAlreadyInUseError('BlogPost', 'taken')),
    });
    const caller = createCaller({ isAdmin: true, catalog });

    await expectTRPCCode(
      caller.blogPosts.admin.create({
        slug: 'taken',
        title: 'Post',
        content: 'Body',
      }),
      'CONFLICT'
    );
  });
});
