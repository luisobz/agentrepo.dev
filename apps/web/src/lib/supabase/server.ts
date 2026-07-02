import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_OPTIONS } from '../auth/cookie-options';
import { getSupabasePublicEnv } from './config';

/**
 * Server-side Supabase client. All auth cookies it writes are forced to
 * HttpOnly so tokens never reach client-side JavaScript; null when the
 * Supabase env keys are not configured.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, { ...options, ...AUTH_COOKIE_OPTIONS });
          }
        } catch {
          // Server Components cannot write cookies; the middleware refresh
          // pass keeps the session cookies up to date instead.
        }
      },
    },
  });
}

/** Current authenticated user (validated against Supabase), or null. */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
