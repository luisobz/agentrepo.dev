/**
 * Minimal Supabase Auth (GoTrue) admin client for seeding: creates the auth
 * user (or resets its password if it already exists) so the seeded DB user
 * can actually log in. Uses plain fetch — no extra dependencies.
 */

export interface SupabaseAdminConfig {
  url: string;
  /** Secret API key (sb_secret_...), replaces the legacy service_role JWT key. */
  secretKey: string;
}

interface SupabaseAuthUser {
  id: string;
  email?: string;
}

const LIST_PAGE_SIZE = 100;
const LIST_MAX_PAGES = 20;

function adminHeaders(config: SupabaseAdminConfig): Record<string, string> {
  return {
    apikey: config.secretKey,
    authorization: `Bearer ${config.secretKey}`,
    'content-type': 'application/json',
  };
}

async function findAuthUserByEmail(
  config: SupabaseAdminConfig,
  email: string
): Promise<SupabaseAuthUser | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= LIST_MAX_PAGES; page++) {
    const response = await fetch(
      `${config.url}/auth/v1/admin/users?page=${page}&per_page=${LIST_PAGE_SIZE}`,
      { headers: adminHeaders(config) }
    );
    if (!response.ok) {
      throw new Error(`Supabase admin list users failed (${response.status})`);
    }
    const body = (await response.json()) as { users?: SupabaseAuthUser[] };
    const users = body.users ?? [];
    const match = users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match;
    if (users.length < LIST_PAGE_SIZE) return null;
  }
  return null;
}

/**
 * Creates the Supabase Auth user with the given credentials, or updates the
 * password of the existing one. Returns the Supabase user id.
 */
export async function ensureSupabaseAuthUser(
  config: SupabaseAdminConfig,
  credentials: { email: string; password: string }
): Promise<string> {
  const createResponse = await fetch(`${config.url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(config),
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      email_confirm: true,
    }),
  });

  if (createResponse.ok) {
    const created = (await createResponse.json()) as SupabaseAuthUser;
    return created.id;
  }

  // 422 = email already registered → locate the user and rotate its password.
  if (createResponse.status !== 422) {
    throw new Error(`Supabase admin create user failed (${createResponse.status})`);
  }

  const existing = await findAuthUserByEmail(config, credentials.email);
  if (!existing) {
    throw new Error(
      `Supabase reports ${credentials.email} as registered but it was not found via the admin API`
    );
  }

  const updateResponse = await fetch(
    `${config.url}/auth/v1/admin/users/${existing.id}`,
    {
      method: 'PUT',
      headers: adminHeaders(config),
      body: JSON.stringify({ password: credentials.password, email_confirm: true }),
    }
  );
  if (!updateResponse.ok) {
    throw new Error(`Supabase admin update user failed (${updateResponse.status})`);
  }
  return existing.id;
}
