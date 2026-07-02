import { PrismaClient } from '@prisma/client';

/**
 * Development-only users, one per role. Credentials live in Supabase Auth
 * (the identity provider): create matching email/password users there when
 * you need to log in locally; `supabaseId` is linked on first login.
 */
const DEV_USERS = [
  { email: 'admin@agentrepo.dev', name: 'Dev Admin', role: 'admin' },
  { email: 'editor@agentrepo.dev', name: 'Dev Editor', role: 'editor' },
  { email: 'member@agentrepo.dev', name: 'Dev Member', role: 'member' },
] as const;

export async function seedDevUsers(prisma: PrismaClient) {
  for (const { email, name, role } of DEV_USERS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, provider: 'email' },
    });

    const savedRole = await prisma.role.findUniqueOrThrow({ where: { name: role } });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: savedRole.id } },
      update: {},
      create: { userId: user.id, roleId: savedRole.id },
    });
  }
  console.log(`users.seed: ${DEV_USERS.length} development users in place`);
}
