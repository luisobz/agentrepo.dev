import type { PrivateSkillRepository } from '@agentrepo/application';
import type { PrivateSkillData } from '@agentrepo/domain';
import { SlugAlreadyInUseError } from '@agentrepo/domain';
import { Prisma, PrismaClient } from '@prisma/client';

const summarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
} as const;

function documentData(data: PrivateSkillData): PrivateSkillData {
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: data.content,
  };
}

function mapConflict(error: unknown, slug: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
    throw new SlugAlreadyInUseError('Private skill', slug);
  throw error;
}

export class PrismaPrivateSkillRepository implements PrivateSkillRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listOwned(ownerId: string, page: { page: number; pageSize: number }) {
    const where = { ownerId };
    const [items, total] = await Promise.all([
      this.prisma.privateSkill.findMany({
        where,
        select: summarySelect,
        orderBy: { updatedAt: 'desc' },
        skip: (page.page - 1) * page.pageSize,
        take: page.pageSize,
      }),
      this.prisma.privateSkill.count({ where }),
    ]);
    return { items, total, page: page.page, pageSize: page.pageSize };
  }

  async findOwned(ownerId: string, id: string) {
    return this.prisma.privateSkill.findFirst({ where: { id, ownerId } });
  }

  async createOwned(ownerId: string, data: PrivateSkillData) {
    try {
      return await this.prisma.privateSkill.create({
        data: { ...documentData(data), ownerId },
      });
    } catch (error) {
      return mapConflict(error, data.slug);
    }
  }

  async updateOwned(
    ownerId: string,
    id: string,
    revision: number,
    data: PrivateSkillData,
  ) {
    try {
      const result = await this.prisma.privateSkill.updateMany({
        where: { id, ownerId, revision },
        data: { ...documentData(data), revision: { increment: 1 } },
      });
      return result.count ? this.findOwned(ownerId, id) : null;
    } catch (error) {
      return mapConflict(error, data.slug);
    }
  }
}
