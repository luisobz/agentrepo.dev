import type {
  AgentVersion,
  SkillVersion,
  VersionListEntry,
} from '@agentrepo/domain';

export interface PublishVersionInput {
  assetId: string;
  version: string;
  changelog: string | null;
}

export interface SetLatestVersionInput {
  assetId: string;
  versionId: string;
}

export interface RecordDownloadInput {
  slug: string;
  /** Omitted → the version currently tagged latest. */
  version?: string;
}

/**
 * npm-style registry operations over the immutable version snapshots of an
 * asset (skill or agent). Implementations must keep `publishFromHead` and
 * `setLatest` transactional: the head row (display copy + latest pointer)
 * and the version rows may never diverge.
 */
export interface AssetVersionRepository<TVersion> {
  /** Every version of the asset, newest first (admin view). */
  listByAssetId(assetId: string): Promise<VersionListEntry<TVersion>[]>;
  /** Versions of a PUBLISHED asset, newest first; null when no such asset. */
  listPublishedBySlug(
    slug: string
  ): Promise<VersionListEntry<TVersion>[] | null>;
  /** One specific version of a published asset. */
  findPublishedBySlugAndVersion(
    slug: string,
    version: string
  ): Promise<TVersion | null>;
  /**
   * Snapshots the asset head as a new immutable version and tags it latest.
   * Throws VersionAlreadyExistsError when the version was already published.
   */
  publishFromHead(input: PublishVersionInput): Promise<TVersion>;
  /** Retags latest to an existing version and mirrors it into the head row. */
  setLatest(input: SetLatestVersionInput): Promise<TVersion>;
  /**
   * Adds one download to the total and to today's bucket. No-ops silently
   * when the asset/version cannot be resolved (never breaks the client UX).
   */
  recordDownload(input: RecordDownloadInput): Promise<void>;
}

export type SkillVersionRepository = AssetVersionRepository<SkillVersion>;
export type AgentVersionRepository = AssetVersionRepository<AgentVersion>;
