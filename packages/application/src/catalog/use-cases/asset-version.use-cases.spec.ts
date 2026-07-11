import {
  DataIntegrityError,
  EntityNotFoundError,
  SkillVersion,
} from '@agentrepo/domain';
import { describe, expect, it, vi } from 'vitest';
import type { AssetVersionRepository } from '../ports/asset-version.repository';
import {
  GetPublishedAssetVersion,
  ListPublishedAssetVersions,
  PublishAssetVersion,
  RecordAssetDownload,
} from './asset-version.use-cases';

const VERSION: SkillVersion = {
  id: 'ver-1',
  skillId: 'skill-1',
  version: '1.0.0',
  content: '# prompt',
  changelog: null,
  downloadsTotal: 10,
  createdAt: new Date('2026-07-01T00:00:00Z'),
};

function buildRepository(): AssetVersionRepository<SkillVersion> {
  return {
    listByAssetId: vi.fn().mockResolvedValue([]),
    listPublishedBySlug: vi.fn().mockResolvedValue(null),
    findPublishedBySlugAndVersion: vi.fn().mockResolvedValue(null),
    publishFromHead: vi.fn().mockResolvedValue(VERSION),
    setLatest: vi.fn().mockResolvedValue(VERSION),
    recordDownload: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ListPublishedAssetVersions', () => {
  it('throws EntityNotFound when the asset does not exist or is unpublished', async () => {
    const repository = buildRepository();
    const useCase = new ListPublishedAssetVersions(repository, 'Skill');

    await expect(useCase.execute('missing-slug')).rejects.toBeInstanceOf(
      EntityNotFoundError
    );
  });

  it('returns the version entries when the asset exists', async () => {
    const repository = buildRepository();
    const entries = [
      { version: VERSION, downloadsWeekly: 3, isLatest: true },
    ];
    vi.mocked(repository.listPublishedBySlug).mockResolvedValue(entries);
    const useCase = new ListPublishedAssetVersions(repository, 'Skill');

    await expect(useCase.execute('my-skill')).resolves.toEqual(entries);
  });
});

describe('GetPublishedAssetVersion', () => {
  it('includes slug@version in the not-found error', async () => {
    const repository = buildRepository();
    const useCase = new GetPublishedAssetVersion(repository, 'Skill');

    await expect(
      useCase.execute({ slug: 'my-skill', version: '9.9.9' })
    ).rejects.toThrow('my-skill@9.9.9');
  });
});

describe('PublishAssetVersion', () => {
  it('rejects malformed versions before touching the repository', () => {
    const repository = buildRepository();
    const useCase = new PublishAssetVersion(repository);

    expect(() =>
      useCase.execute({ assetId: 'skill-1', version: 'not-semver', changelog: null })
    ).toThrow(DataIntegrityError);
    expect(repository.publishFromHead).not.toHaveBeenCalled();
  });

  it('delegates valid publishes to the repository', async () => {
    const repository = buildRepository();
    const useCase = new PublishAssetVersion(repository);

    await expect(
      useCase.execute({ assetId: 'skill-1', version: '1.1.0', changelog: 'fix' })
    ).resolves.toEqual(VERSION);
    expect(repository.publishFromHead).toHaveBeenCalledWith({
      assetId: 'skill-1',
      version: '1.1.0',
      changelog: 'fix',
    });
  });
});

describe('RecordAssetDownload', () => {
  it('passes slug and optional version through', async () => {
    const repository = buildRepository();
    const useCase = new RecordAssetDownload(repository);

    await useCase.execute({ slug: 'my-skill', version: '1.0.0' });

    expect(repository.recordDownload).toHaveBeenCalledWith({
      slug: 'my-skill',
      version: '1.0.0',
    });
  });
});
