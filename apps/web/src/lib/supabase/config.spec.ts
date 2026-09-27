import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSupabasePublicEnv } from './config';

describe('getSupabasePublicEnv', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('ignores placeholder URLs so local pages can load without Supabase', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'your-project-url');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'your-key');
    expect(getSupabasePublicEnv()).toBeNull();
  });

  it('accepts a valid Supabase HTTPS URL and publishable key', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    expect(getSupabasePublicEnv()).toEqual({
      url: 'https://example.supabase.co',
      publishableKey: 'sb_publishable_test',
    });
  });
});
