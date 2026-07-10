import { PrismaClient } from '@prisma/client';
import { ensureSupabaseAuthUser } from './lib/supabase-auth-admin';

/**
 * Development-only users, one per role. The admin user is also created in
 * Supabase Auth (the identity provider) when the Supabase env vars are set,
 * so the admin panel login works out of the box; editor/member credentials
 * can still be created manually in Supabase when needed.
 */
const DEV_USERS = [
  { email: 'admin@agentrepo.dev', name: 'Dev Admin', role: 'admin' },
  { email: 'editor@agentrepo.dev', name: 'Dev Editor', role: 'editor' },
  { email: 'member@agentrepo.dev', name: 'Dev Member', role: 'member' },
] as const;

const DEFAULT_DEV_ADMIN_PASSWORD = 'agentrepo-dev-admin';

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

    if (role === 'admin') {
      await syncDevAdminAuthUser(prisma, user.id, email);
    }
  }
  console.log(`users.seed: ${DEV_USERS.length} development users in place`);
}

/** Registers the dev admin in Supabase Auth so the panel login works locally. */
async function syncDevAdminAuthUser(prisma: PrismaClient, userId: string, email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    console.warn(
      'users.seed: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY not set — create the admin auth user manually in Supabase'
    );
    return;
  }

  const password = process.env.DEV_ADMIN_PASSWORD || DEFAULT_DEV_ADMIN_PASSWORD;
  const supabaseId = await ensureSupabaseAuthUser(
    { url, secretKey },
    { email, password }
  );
  await prisma.user.update({ where: { id: userId }, data: { supabaseId } });
  console.log(
    `users.seed: dev admin registered in Supabase Auth (${email}, password from ${
      process.env.DEV_ADMIN_PASSWORD ? 'DEV_ADMIN_PASSWORD' : 'dev default'
    })`
  );
}
