import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { decryptSeedData } from './lib/seed-crypto';
import { ensureSupabaseAuthUser } from './lib/supabase-auth-admin';
import { seedRoles } from './roles.seed';

/**
 * Production seed. The sensitive payload (real users and their initial
 * passwords) lives in `prod.seed.data.enc`, encrypted with
 * SEED_ENCRYPTION_KEY so it can be committed to the public repository.
 * Manage it with `pnpm db:seed:encrypt` / `pnpm db:seed:decrypt`.
 */

const ENCRYPTED_DATA_FILE = path.resolve(__dirname, 'prod.seed.data.enc');

interface ProdSeedUser {
  email: string;
  name: string;
  role: string;
  /** Initial password, provisioned into Supabase Auth (never stored in our DB). */
  password: string;
}

interface ProdSeedData {
  users: ProdSeedUser[];
}

function loadSeedData(): ProdSeedData {
  const key = process.env.SEED_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('SEED_ENCRYPTION_KEY is required to decrypt the production seed data');
  }
  if (!existsSync(ENCRYPTED_DATA_FILE)) {
    throw new Error(
      `Encrypted seed data not found at ${ENCRYPTED_DATA_FILE} — generate it with "pnpm db:seed:encrypt"`
    );
  }
  return JSON.parse(decryptSeedData(readFileSync(ENCRYPTED_DATA_FILE, 'utf8'), key));
}

export async function seed(prisma: PrismaClient) {
  await seedRoles(prisma);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required to seed production users'
    );
  }

  const { users } = loadSeedData();
  for (const { email, name, role, password } of users) {
    const supabaseId = await ensureSupabaseAuthUser(
      { url, secretKey },
      { email, password }
    );

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, supabaseId },
      create: { email, name, supabaseId, provider: 'email' },
    });

    const savedRole = await prisma.role.findUniqueOrThrow({ where: { name: role } });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: savedRole.id } },
      update: {},
      create: { userId: user.id, roleId: savedRole.id },
    });
    console.log(`prod.seed: user ${email} (${role}) in place`);
  }

  console.log('prod.seed: Completed');
}
