/**
 * Client-safe Supabase config helpers: NEXT_PUBLIC_* vars are inlined in
 * both server and browser bundles, so no secrets live here.
 */

export interface SupabasePublicEnv {
  url: string;
  /** New-style publishable API key (sb_publishable_...), replaces the legacy anon JWT key. */
  publishableKey: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
