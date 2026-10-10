import type {
  ContributorIdentity,
  ContributorRepository,
} from '@agentrepo/application';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaContributorRepository implements ContributorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findOrCreate(identity: ContributorIdentity): Promise<string | null> {
    const existing = await this.prisma.user.findUnique({
      where: { supabaseId: identity.providerUserId },
    });
    if (existing) return existing.id;
    // Never relink another account by email, even if its profile looks identical.
    if (await this.prisma.user.findUnique({ where: { email: identity.email } }))
      return null;
    try {
      const user = await this.prisma.user.create({
        data: {
          supabaseId: identity.providerUserId,
          email: identity.email,
          name: identity.name,
          provider: identity.provider,
          roles: {
            create: {
              role: {
                connectOrCreate: {
                  where: { name: 'member' },
                  create: { name: 'member' },
                },
              },
            },
          },
        },
      });
      return user.id;
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      )
        throw error;
      return (
        (
          await this.prisma.user.findUnique({
            where: { supabaseId: identity.providerUserId },
          })
        )?.id ?? null
      );
    }
  }
}
