import type {
  ContentSignal,
  PopularityKind,
  PopularityRepository,
} from '@agentrepo/application';
import { Prisma, type PrismaClient } from '@prisma/client';
import { todayUtc } from './version-stats';

const tables = { skill: 'Skill', agent: 'Agent', blog: 'BlogPost' } as const;
export class PrismaPopularityRepository implements PopularityRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async recent(since: Date): Promise<ContentSignal[]> {
    // Names are constants, never request data. Aggregate before joining versions.
    const parts = (Object.keys(tables) as PopularityKind[]).map((kind) => {
      const table = Prisma.raw(`"${tables[kind]}"`);
      const downloads =
        kind === 'blog'
          ? Prisma.sql`0`
          : Prisma.sql`COALESCE((
        SELECT SUM(d.count) FROM ${Prisma.raw(kind === 'skill' ? '"SkillVersionDownloadDay"' : '"AgentVersionDownloadDay"')} d
        JOIN ${Prisma.raw(kind === 'skill' ? '"SkillVersion"' : '"AgentVersion"')} v ON v.id = d."versionId"
        WHERE v.${Prisma.raw(kind === 'skill' ? '"skillId"' : '"agentId"')} = c.id AND d.day >= ${since}
      ), 0)`;
      return Prisma.sql`SELECT ${kind}::text AS kind, c.slug,
        COALESCE((SELECT SUM(count) FROM "ContentViewDay" WHERE kind = ${kind} AND "contentId" = c.id AND day >= ${since}), 0)::int AS views,
        (${downloads})::int AS downloads
        FROM ${table} c WHERE c."isPublished" = true`;
    });
    return this.prisma.$queryRaw<ContentSignal[]>(
      Prisma.join(parts, ' UNION ALL '),
    );
  }
  async recordView(kind: PopularityKind, slug: string): Promise<void> {
    const table = Prisma.raw(`"${tables[kind]}"`);
    await this.prisma
      .$executeRaw`INSERT INTO "ContentViewDay" (kind, "contentId", day, count)
      SELECT ${kind}, id, ${todayUtc()}, 1 FROM ${table} WHERE slug = ${slug} AND "isPublished" = true
      ON CONFLICT (kind, "contentId", day) DO UPDATE SET count = "ContentViewDay".count + 1`;
  }
}
