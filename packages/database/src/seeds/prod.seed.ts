import { PrismaClient } from '@prisma/client';

export async function seed(prisma: PrismaClient) {
  console.error('Production seed not included in this public repository.');
  throw new Error('Production seed missing — provide a private seed in CI or a private repo.');
}
