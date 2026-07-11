import {
  EntityNotFoundError,
  isValidSemver,
  type VersionListEntry,
} from '@agentrepo/domain';
import { DataIntegrityError } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import type {
  AssetVersionRepository,
  PublishVersionInput,
  RecordDownloadInput,
  SetLatestVersionInput,
} from '../ports/asset-version.repository';

export interface GetPublishedVersionParams {
  slug: string;
  version: string;
}

export class ListAssetVersionsForAdmin<TVersion>
  implements UseCase<string, VersionListEntry<TVersion>[]>
{
  constructor(private readonly versions: AssetVersionRepository<TVersion>) {}

  execute(assetId: string): Promise<VersionListEntry<TVersion>[]> {
    return this.versions.listByAssetId(assetId);
  }
}

export class ListPublishedAssetVersions<TVersion>
  implements UseCase<string, VersionListEntry<TVersion>[]>
{
  constructor(
    private readonly versions: AssetVersionRepository<TVersion>,
    private readonly entityName: string
  ) {}

  async execute(slug: string): Promise<VersionListEntry<TVersion>[]> {
    const found = await this.versions.listPublishedBySlug(slug);
    if (!found) {
      throw new EntityNotFoundError(this.entityName, slug);
    }
    return found;
  }
}

export class GetPublishedAssetVersion<TVersion>
  implements UseCase<GetPublishedVersionParams, TVersion>
{
  constructor(
    private readonly versions: AssetVersionRepository<TVersion>,
    private readonly entityName: string
  ) {}

  async execute(params: GetPublishedVersionParams): Promise<TVersion> {
    const found = await this.versions.findPublishedBySlugAndVersion(
      params.slug,
      params.version
    );
    if (!found) {
      throw new EntityNotFoundError(
        this.entityName,
        `${params.slug}@${params.version}`
      );
    }
    return found;
  }
}

export class PublishAssetVersion<TVersion>
  implements UseCase<PublishVersionInput, TVersion>
{
  constructor(private readonly versions: AssetVersionRepository<TVersion>) {}

  execute(input: PublishVersionInput): Promise<TVersion> {
    if (!isValidSemver(input.version)) {
      throw new DataIntegrityError(
        `"${input.version}" is not a valid semver version`
      );
    }
    return this.versions.publishFromHead(input);
  }
}

export class SetLatestAssetVersion<TVersion>
  implements UseCase<SetLatestVersionInput, TVersion>
{
  constructor(private readonly versions: AssetVersionRepository<TVersion>) {}

  execute(input: SetLatestVersionInput): Promise<TVersion> {
    return this.versions.setLatest(input);
  }
}

export class RecordAssetDownload
  implements UseCase<RecordDownloadInput, void>
{
  constructor(private readonly versions: AssetVersionRepository<unknown>) {}

  execute(input: RecordDownloadInput): Promise<void> {
    return this.versions.recordDownload(input);
  }
}
