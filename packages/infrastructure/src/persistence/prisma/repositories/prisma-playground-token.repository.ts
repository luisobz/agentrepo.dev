import {
  CreatePlaygroundTokenInput,
  ListPlaygroundTokensParams,
  Paginated,
  PlaygroundTokenRepository,
} from '@agentrepo/application';
import { PlaygroundToken } from '@agentrepo/domain';
import { PrismaClient } from '@prisma/client';

export class PrismaPlaygroundTokenRepository
  implements PlaygroundTokenRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreatePlaygroundTokenInput): Promise<PlaygroundToken> {
    return this.prisma.playgroundToken.create({ data: input });
  }

  async list(
    params: ListPlaygroundTokensParams
  ): Promise<Paginated<PlaygroundToken>> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.playgroundToken.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.playgroundToken.count(),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  findByToken(token: string): Promise<PlaygroundToken | null> {
    return this.prisma.playgroundToken.findUnique({ where: { token } });
  }

  async consumeUse(token: string, now: Date): Promise<PlaygroundToken | null> {
    // updateMany applies the guard and the increment in one statement, so two
    // concurrent submissions cannot both consume the last remaining use.
    const consumed = await this.prisma.playgroundToken.updateMany({
      where: {
        token,
        isActive: true,
        expiresAt: { gt: now },
        usesCount: { lt: this.prisma.playgroundToken.fields.maxUses },
      },
      data: { usesCount: { increment: 1 } },
    });
    if (consumed.count === 0) {
      return null;
    }
    return this.findByToken(token);
  }

  async setActive(id: string, isActive: boolean): Promise<PlaygroundToken> {
    return this.prisma.playgroundToken.update({
      where: { id },
      data: { isActive },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.playgroundToken.delete({ where: { id } });
  }
}
