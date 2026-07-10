import { AdminUser, AdminUserRepository } from '@agentrepo/application';
import { PrismaClient } from '@prisma/client';

export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    return this.prisma.user.findFirst({
      where: { email, roles: { some: { role: { name: 'admin' } } } },
      select: { id: true, email: true, supabaseId: true },
    });
  }

  async linkSupabaseId(userId: string, supabaseId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { supabaseId },
    });
  }
}
