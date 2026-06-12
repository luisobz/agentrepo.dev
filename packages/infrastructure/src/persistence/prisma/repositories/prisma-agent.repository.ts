import {
  AgentRepository,
  CreateAgentInput,
  ListContentParams,
  Paginated,
  UpdateAgentInput,
} from '@agentrepo/application';
import { Agent, DataIntegrityError, FileTree, isFileTree } from '@agentrepo/domain';
import { Prisma, PrismaClient, Agent as AgentRow } from '@prisma/client';

function fileTreeFromJson(value: Prisma.JsonValue, agentId: string): FileTree {
  if (!isFileTree(value)) {
    throw new DataIntegrityError(`agent ${agentId} has a malformed fileTree`);
  }
  return value;
}

function toDomain(row: AgentRow): Agent {
  return { ...row, fileTree: fileTreeFromJson(row.fileTree, row.id) };
}

export class PrismaAgentRepository implements AgentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: ListContentParams): Promise<Paginated<Agent>> {
    const where: Prisma.AgentWhereInput = {
      ...(params.publishedOnly ? { isPublished: true } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { slug: { contains: params.search, mode: 'insensitive' } },
              {
                shortDescription: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.agent.findMany({
        where,
        orderBy:
          params.orderBy === 'createdAt'
            ? { createdAt: 'desc' }
            : { updatedAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.agent.count({ where }),
    ]);

    return {
      items: rows.map(toDomain),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findById(id: string): Promise<Agent | null> {
    const row = await this.prisma.agent.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Agent | null> {
    const row = await this.prisma.agent.findUnique({ where: { slug } });
    return row ? toDomain(row) : null;
  }

  async existsSlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.agent.count({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  }

  async create(data: CreateAgentInput): Promise<Agent> {
    return toDomain(await this.prisma.agent.create({ data }));
  }

  async update(id: string, data: UpdateAgentInput): Promise<Agent> {
    return toDomain(await this.prisma.agent.update({ where: { id }, data }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agent.delete({ where: { id } });
  }
}
