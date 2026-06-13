import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import path from 'path';
import { seed as devSeed } from './dev.seed';
import { seed as prodSeed } from './prod.seed';

// Load the workspace-root .env regardless of the cwd the seed runs from.
config({ path: path.resolve(__dirname, '../../../../.env') });

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
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
