import {
  localizeContent,
  type LocalizedContent,
  type ContentLocale,
  type VersionListEntry,
} from '@agentrepo/domain';

interface VersionRecord extends LocalizedContent {
  id: string;
  version: string;
  changelog: string | null;
  downloadsTotal: number;
  createdAt: Date;
}

/**
 * Registry listing entry without the content payload: version lists are
 * metadata + stats only (and premium bodies must never leak through them).
 */
export interface VersionSummary {
  id: string;
  version: string;
  changelog: string | null;
  createdAt: Date;
  downloadsTotal: number;
  downloadsWeekly: number;
  isLatest: boolean;
}

export function toVersionSummary<TVersion extends VersionRecord>(
  entry: VersionListEntry<TVersion>,
  locale?: ContentLocale,
): VersionSummary {
  return {
    id: entry.version.id,
    version: entry.version.version,
    changelog: localizeContent(entry.version, locale).changelog,
    createdAt: entry.version.createdAt,
    downloadsTotal: entry.version.downloadsTotal,
    downloadsWeekly: entry.downloadsWeekly,
    isLatest: entry.isLatest,
  };
}
