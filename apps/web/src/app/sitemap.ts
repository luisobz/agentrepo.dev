import type { MetadataRoute } from 'next';
import { getPublishedAgents } from '../lib/agents';
import { getPublishedPosts } from '../lib/blog';
import { getPublishedSkills } from '../lib/skills';

const SITE_URL = 'https://agentrepo.dev';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/skills`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/agents`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/playground`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    const [skills, agents, posts] = await Promise.all([
      getPublishedSkills(),
      getPublishedAgents(),
      getPublishedPosts(),
    ]);
    return [
      ...staticEntries,
      ...skills.map((skill) => ({
        url: `${SITE_URL}/skills/${skill.slug}`,
        lastModified: skill.updatedAt,
      })),
      ...agents.map((agent) => ({
        url: `${SITE_URL}/agents/${agent.slug}`,
        lastModified: agent.updatedAt,
      })),
      ...posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
      })),
    ];
  } catch {
    // The API may be unreachable (e.g. build time); static routes still ship.
    return staticEntries;
  }
}
