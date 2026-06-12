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

function toDomain(row: SkillRow): Skill {
  return { ...row, type: assertSkillType(row.type) };
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
      items: rows.map(toDomain),
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

    const where: Prisma.SkillWhereInput = {
      isPublished: true,
      OR: [
        { title: { search: tsQuery } },
        { description: { search: tsQuery } },
        { content: { search: tsQuery } },
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.skill.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.skill.count({ where }),
    ]);

    return {
      items: rows.map(toDomain),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findById(id: string): Promise<Skill | null> {
    const row = await this.prisma.skill.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Skill | null> {
    const row = await this.prisma.skill.findUnique({ where: { slug } });
    return row ? toDomain(row) : null;
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
