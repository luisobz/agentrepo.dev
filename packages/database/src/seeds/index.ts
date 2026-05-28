import { PrismaClient } from '@prisma/client';
import { seed as devSeed } from './dev.seed';
import { seed as prodSeed } from './prod.seed';

async function main() {
  const prisma = new PrismaClient();
  const env = (process.env.NODE_ENV || 'development').toLowerCase();
  console.log(`prisma/seeds index: environment=${env}`);
  try {
    if (env === 'development' || env === 'dev' || env === 'local') {
      await devSeed(prisma);
    } else if (env === 'production' || env === 'prod' || env === 'pre') {
      await prodSeed(prisma);
    } else {
      console.log('No seed for environment:', env);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Seed runner failed', e);
  process.exit(1);
});
