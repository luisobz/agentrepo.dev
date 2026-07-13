import type { SkillVersion, VersionListEntry } from '@agentrepo/domain';
import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { TRPCContext } from '../trpc';
import { appRouter } from './_app';

const VERSION: SkillVersion = {
  id: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
  skillId: 'skill-1',
  version: '1.1.0',
  content: '# secret prompt',
  changelog: 'Improved guardrails',
  downloadsTotal: 42,
  createdAt: new Date('2026-07-01T00:00:00Z'),
};

const ENTRY: VersionListEntry<SkillVersion> = {
  version: VERSION,
  downloadsWeekly: 7,
  isLatest: true,
};

function buildContext(options?: {
  isAdmin?: boolean;
  isPremium?: boolean;
}): TRPCContext {
  return {
    isAdmin: options?.isAdmin ?? false,
    clientIp: crypto.randomUUID(),
    adminAuth: {} as TRPCContext['adminAuth'],
    globalSearch: { execute: async () => [] },
    portfolio: {} as TRPCContext['portfolio'],
    playground: {} as TRPCContext['playground'],
    catalog: {
      skills: {
        getPublishedBySlug: {
          execute: vi
            .fn()
            .mockResolvedValue({ isPremium: options?.isPremium ?? false }),
        },
      },
      skillVersions: {
        listPublished: { execute: vi.fn().mockResolvedValue([ENTRY]) },
        listForAdmin: { execute: vi.fn().mockResolvedValue([ENTRY]) },
        getPublished: { execute: vi.fn().mockResolvedValue(VERSION) },
        publish: { execute: vi.fn().mockResolvedValue(VERSION) },
        setLatest: { execute: vi.fn().mockResolvedValue(VERSION) },
        recordDownload: { execute: vi.fn().mockResolvedValue(undefined) },
      },
    } as unknown as TRPCContext['catalog'],
  };
}

describe('skills version endpoints', () => {
  it('lists version metadata with stats but never the content', async () => {
    const caller = appRouter.createCaller(buildContext());

    const versions = await caller.skills.versions({ slug: 'my-skill' });

    expect(versions).toEqual([
      {
        id: VERSION.id,
        version: '1.1.0',
        changelog: 'Improved guardrails',
        createdAt: VERSION.createdAt,
        downloadsTotal: 42,
        downloadsWeekly: 7,
        isLatest: true,
      },
    ]);
    expect(JSON.stringify(versions)).not.toContain('secret prompt');
  });

  it('serves a pinned version with content for free skills', async () => {
    const caller = appRouter.createCaller(buildContext({ isPremium: false }));

    const version = await caller.skills.byVersion({
      slug: 'my-skill',
      version: '1.1.0',
    });

    expect(version.content).toBe('# secret prompt');
    expect(version.isLocked).toBe(false);
  });

  it('redacts pinned versions of premium skills', async () => {
    const caller = appRouter.createCaller(buildContext({ isPremium: true }));

    const version = await caller.skills.byVersion({
      slug: 'my-skill',
      version: '1.1.0',
    });

    expect(version.content).toBe('');
    expect(version.isLocked).toBe(true);
  });

  it('records downloads without requiring a version', async () => {
    const ctx = buildContext();
    const caller = appRouter.createCaller(ctx);

    await caller.skills.recordDownload({ slug: 'my-skill' });

    expect(ctx.catalog.skillVersions.recordDownload.execute).toHaveBeenCalledWith({
      slug: 'my-skill',
    });
  });

  it('rejects malformed versions at the schema boundary', async () => {
    const caller = appRouter.createCaller(buildContext());

    await expect(
      caller.skills.byVersion({ slug: 'my-skill', version: 'latest' })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it('requires admin for publishing and retagging', async () => {
    const caller = appRouter.createCaller(buildContext({ isAdmin: false }));

    await expect(
      caller.skills.admin.publishVersion({
        id: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
        version: '1.2.0',
        changelog: null,
      })
    ).rejects.toSatisfy(
      (error) => error instanceof TRPCError && error.code === 'UNAUTHORIZED'
    );
  });

  it('lets admins publish and retag latest', async () => {
    const ctx = buildContext({ isAdmin: true });
    const caller = appRouter.createCaller(ctx);

    await caller.skills.admin.publishVersion({
      id: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
      version: '1.2.0',
      changelog: 'notes',
    });
    await caller.skills.admin.setLatestVersion({
      id: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
      versionId: 'c4c7b9b3-9f5f-4b74-8b3f-4f9f1f0e3d22',
    });

    expect(ctx.catalog.skillVersions.publish.execute).toHaveBeenCalledWith({
      assetId: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
      version: '1.2.0',
      changelog: 'notes',
    });
    expect(ctx.catalog.skillVersions.setLatest.execute).toHaveBeenCalledWith({
      assetId: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
      versionId: 'c4c7b9b3-9f5f-4b74-8b3f-4f9f1f0e3d22',
    });
  });
});
