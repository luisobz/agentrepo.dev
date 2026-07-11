import {
  GlobalSearchParams,
  GlobalSearchRepository,
} from '@agentrepo/application';
import { SearchHit } from '@agentrepo/domain';
import { Prisma, PrismaClient } from '@prisma/client';
import { toTsQuery } from '../full-text';

interface SkillHitRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
}
interface AgentHitRow {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  version: string;
}
interface PostHitRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
}

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

    // Query the trigger-maintained `searchVector` GIN indexes directly; Prisma's
    // `{ field: { search } }` filter is not index-backed (see the skill repo).
    const match = (table: string) => Prisma.sql`
      ${Prisma.raw(`"${table}"."searchVector"`)} @@ to_tsquery('english', ${tsQuery})
    `;

    const [skills, agents, posts] = await Promise.all([
      this.prisma.$queryRaw<SkillHitRow[]>(Prisma.sql`
        SELECT "id", "slug", "title", "description", "type" FROM "Skill"
        WHERE "isPublished" = true AND ${match('Skill')}
        ORDER BY "updatedAt" DESC LIMIT ${limitPerType}
      `),
      this.prisma.$queryRaw<AgentHitRow[]>(Prisma.sql`
        SELECT "id", "slug", "title", "shortDescription", "version" FROM "Agent"
        WHERE "isPublished" = true AND ${match('Agent')}
        ORDER BY "updatedAt" DESC LIMIT ${limitPerType}
      `),
      this.prisma.$queryRaw<PostHitRow[]>(Prisma.sql`
        SELECT "id", "slug", "title", "excerpt" FROM "BlogPost"
        WHERE "isPublished" = true AND ${match('BlogPost')}
        ORDER BY "updatedAt" DESC LIMIT ${limitPerType}
      `),
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
