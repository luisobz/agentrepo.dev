import { PrismaClient } from '@prisma/client';
import { seedRoles } from './roles.seed';

export async function seed(prisma: PrismaClient) {
  await seedRoles(prisma);
  console.error('Production seed not included in this public repository.');
  throw new Error('Production seed missing — provide a private seed in CI or a private repo.');
}
