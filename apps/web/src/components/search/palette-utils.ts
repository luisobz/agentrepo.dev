import type { RouterOutputs } from '@agentrepo/trpc/schemas';

export type SearchHit = RouterOutputs['search']['global'][number];

const HREF_PREFIX: Record<SearchHit['type'], string> = {
  skill: '/skills',
  agent: '/agents',
  blog: '/blog',
};

export function hitHref(hit: SearchHit): string {
  return `${HREF_PREFIX[hit.type]}/${hit.slug}`;
}

const GROUP_ORDER: { type: SearchHit['type']; label: string }[] = [
  { type: 'skill', label: 'Skills' },
  { type: 'agent', label: 'Agents' },
  { type: 'blog', label: 'Blog' },
];

export interface HitGroup {
  label: string;
  hits: SearchHit[];
}

export function groupHits(hits: SearchHit[]): HitGroup[] {
  return GROUP_ORDER.map(({ type, label }) => ({
    label,
    hits: hits.filter((hit) => hit.type === type),
  })).filter((group) => group.hits.length > 0);
}

export function flattenGroups(groups: HitGroup[]): SearchHit[] {
  return groups.flatMap((group) => group.hits);
}

/** Moves the keyboard selection by `delta`, wrapping around both ends. */
export function moveSelection(
  current: number,
  delta: number,
  length: number
): number {
  if (length === 0) {
    return 0;
  }
  return (current + delta + length) % length;
}
