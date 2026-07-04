import {
  AdminSessionRepository,
  CreateAdminSessionInput,
} from '@agentrepo/application';
import { AdminSession } from '@agentrepo/domain';
import { PrismaClient } from '@prisma/client';

export class PrismaAdminSessionRepository implements AdminSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAdminSessionInput): Promise<AdminSession> {
    return this.prisma.adminSession.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<AdminSession | null> {
    return this.prisma.adminSession.findUnique({ where: { tokenHash } });
  }

  async markReplaced(id: string, replacedById: string, revokedAt: Date): Promise<void> {
    await this.prisma.adminSession.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt, replacedById },
    });
  }

  async revokeFamily(familyId: string, revokedAt: Date): Promise<void> {
    await this.prisma.adminSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt },
    });
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.prisma.adminSession.deleteMany({
      where: { expiresAt: { lte: now } },
    });
  }
}
