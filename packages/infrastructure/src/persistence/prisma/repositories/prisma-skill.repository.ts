import {
  CreateSkillInput,
  ListContentParams,
  Paginated,
  SearchSkillsParams,
  SkillRepository,
  UpdateSkillInput,
} from '@agentrepo/application';
import { Skill, assertSkillType } from '@agentrepo/domain';
import { Prisma, PrismaClient, Skill as SkillRow } from '@prisma/client';
import { toTsQuery } from '../full-text';

function toDomain(row: SkillRow, authorName?: string | null): Skill {
  return { ...row, type: assertSkillType(row.type), authorName };
}

function buildSearchFilter(search: string): Prisma.SkillWhereInput {
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  };
}

export class PrismaSkillRepository implements SkillRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: ListContentParams): Promise<Paginated<Skill>> {
    const where: Prisma.SkillWhereInput = {
      ...(params.publishedOnly ? { isPublished: true } : {}),
      ...(params.search ? buildSearchFilter(params.search) : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.skill.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy:
          params.orderBy === 'createdAt'
            ? { createdAt: 'desc' }
            : { updatedAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.skill.count({ where }),
    ]);

    return {
      items: rows.map((row) => toDomain(row, row.author?.name)),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async searchPublished(params: SearchSkillsParams): Promise<Paginated<Skill>> {
    const tsQuery = toTsQuery(params.query, { prefixLast: true });
    if (!tsQuery) {
      return { items: [], total: 0, page: params.page, pageSize: params.pageSize };
    }

    // Query the trigger-maintained `searchVector` GIN index directly. Prisma's
    // own `{ field: { search } }` compiles to an un-indexable to_tsvector()
    // computed per row (full-table scan); this uses the index instead.
    const skip = (params.page - 1) * params.pageSize;
    const filter = Prisma.sql`"isPublished" = true AND "searchVector" @@ to_tsquery('english', ${tsQuery})`;

    const [rows, totals] = await this.prisma.$transaction([
      this.prisma.$queryRaw<(SkillRow & { authorName: string | null })[]>(Prisma.sql`
        SELECT "id", "slug", "title", "description", "content", "type", "version",
               "isPublished", "headerImageUrl", "isPremium", "priceCents", "currency",
               "previewContent", "createdAt", "updatedAt", "latestVersionId", "authorId",
               (SELECT "name" FROM "User" WHERE "User"."id" = "Skill"."authorId") AS "authorName"
        FROM "Skill"
        WHERE ${filter}
        ORDER BY "updatedAt" DESC
        LIMIT ${params.pageSize} OFFSET ${skip}
      `),
      this.prisma.$queryRaw<{ count: number }[]>(
        Prisma.sql`SELECT count(*)::int AS count FROM "Skill" WHERE ${filter}`
      ),
    ]);

    return {
      items: rows.map((row) => toDomain(row, row.authorName)),
      total: totals[0]?.count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findById(id: string): Promise<Skill | null> {
    const row = await this.prisma.skill.findUnique({ where: { id }, include: { author: { select: { name: true } } } });
    return row ? toDomain(row, row.author?.name) : null;
  }

  async findBySlug(slug: string): Promise<Skill | null> {
    const row = await this.prisma.skill.findUnique({ where: { slug }, include: { author: { select: { name: true } } } });
    return row ? toDomain(row, row.author?.name) : null;
  }

  async existsSlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.skill.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }

  async create(data: CreateSkillInput): Promise<Skill> {
    return toDomain(await this.prisma.skill.create({ data }));
  }

  async update(id: string, data: UpdateSkillInput): Promise<Skill> {
    return toDomain(await this.prisma.skill.update({ where: { id }, data }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.skill.delete({ where: { id } });
  }
}
