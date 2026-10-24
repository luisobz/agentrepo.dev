import { cache } from 'react';
import { semverSchema, slugSchema } from '@agentrepo/trpc/schemas';
import { getPublishedSkillBySlug, getSkillVersion } from './skills';

export function skillVersionHref(slug: string, version: string): string {
  return `/skills/${encodeURIComponent(slug)}/${encodeURIComponent(version)}`;
}

export const getPinnedSkillRelease = cache(
  async (slug: string, version: string) => {
    if (
      !slugSchema.safeParse(slug).success ||
      !semverSchema.safeParse(version).success
    )
      return null;
    const [skill, pinned] = await Promise.all([
      getPublishedSkillBySlug(slug),
      getSkillVersion(slug, version),
    ]);
    if (!skill || !pinned || pinned.version !== version) return null;
    return { skill, pinned };
  },
);
