import {
  GlobalSearchParams,
  GlobalSearchRepository,
} from '@agentrepo/application';
import { SearchHit } from '@agentrepo/domain';
import { PrismaClient } from '@prisma/client';
import { toTsQuery } from '../full-text';

export class PrismaGlobalSearchRepository implements GlobalSearchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async searchPublished({
    query,
    limitPerType,
  }: GlobalSearchParams): Promise<SearchHit[]> {
    const tsQuery = toTsQuery(query, { prefixLast: true });
    if (!tsQuery) {
      return [];
    }

    const [skills, agents, posts] = await Promise.all([
      this.prisma.skill.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { search: tsQuery } },
            { description: { search: tsQuery } },
            { content: { search: tsQuery } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limitPerType,
      }),
      this.prisma.agent.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { search: tsQuery } },
            { shortDescription: { search: tsQuery } },
            { readmeContent: { search: tsQuery } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limitPerType,
      }),
      this.prisma.blogPost.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { search: tsQuery } },
            { excerpt: { search: tsQuery } },
            { content: { search: tsQuery } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limitPerType,
      }),
    ]);

    return [
      ...skills.map(
        (skill): SearchHit => ({
          id: skill.id,
          slug: skill.slug,
          title: skill.title,
          description: skill.description ?? '',
          type: 'skill',
          badge: skill.type,
        })
      ),
      ...agents.map(
        (agent): SearchHit => ({
          id: agent.id,
          slug: agent.slug,
          title: agent.title,
          description: agent.shortDescription,
          type: 'agent',
          badge: `v${agent.version}`,
        })
      ),
      ...posts.map(
        (post): SearchHit => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          description: post.excerpt ?? '',
          type: 'blog',
        })
      ),
    ];
  }
}
