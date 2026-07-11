import { DomainError } from '../errors/domain.error';
import type { FileTree } from './file-tree';

export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export function isValidSemver(value: string): boolean {
  return SEMVER_REGEX.test(value);
}

function parseSemver(version: string): [number, number, number] {
  const [major, minor, patch] = version.split('.').map(Number);
  return [major, minor, patch];
}

/** Standard comparator: negative when a < b, positive when a > b. */
export function compareSemver(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = parseSemver(a);
  const [bMajor, bMinor, bPatch] = parseSemver(b);
  return aMajor - bMajor || aMinor - bMinor || aPatch - bPatch;
}

export function nextPatch(version: string): string {
  const [major, minor, patch] = parseSemver(version);
  return `${major}.${minor}.${patch + 1}`;
}

export function nextMinor(version: string): string {
  const [major, minor] = parseSemver(version);
  return `${major}.${minor + 1}.0`;
}

export function nextMajor(version: string): string {
  const [major] = parseSemver(version);
  return `${major + 1}.0.0`;
}

export class VersionAlreadyExistsError extends DomainError {
  readonly code = 'VERSION_ALREADY_EXISTS';

  constructor(entityName: string, version: string) {
    super(`${entityName} version already published: ${version}`);
  }
}

/** Immutable snapshot of a published skill release. */
export interface SkillVersion {
  id: string;
  skillId: string;
  version: string;
  content: string;
  changelog: string | null;
  downloadsTotal: number;
  createdAt: Date;
}

/** Immutable snapshot of a published agent release. */
export interface AgentVersion {
  id: string;
  agentId: string;
  version: string;
  readmeContent: string | null;
  fileTree: FileTree;
  changelog: string | null;
  downloadsTotal: number;
  createdAt: Date;
}

/** Registry-style listing entry: a version plus its download stats. */
export interface VersionListEntry<TVersion> {
  version: TVersion;
  downloadsWeekly: number;
  isLatest: boolean;
}
