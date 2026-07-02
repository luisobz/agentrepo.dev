/**
 * Client-safe Supabase config helpers: NEXT_PUBLIC_* vars are inlined in
 * both server and browser bundles, so no secrets live here.
 */

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
