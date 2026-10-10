import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabaseContributorVerifier } from './supabase-contributor-verifier';

const verifier = new SupabaseContributorVerifier({
  url: 'https://project.supabase.co',
  publishableKey: 'public-test-key',
});

describe('Supabase contributor verification', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('uses validated Auth identity and ignores editable privilege claims', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            id: 'identity-one',
            email: 'Creator@example.test',
            email_confirmed_at: '2026-10-10',
            user_metadata: {
              full_name: 'Creator',
              role: 'admin',
              provider: 'github',
            },
            app_metadata: { provider: 'email' },
          }),
        ),
    );
    expect(await verifier.verify('test-session')).toEqual({
      providerUserId: 'identity-one',
      email: 'creator@example.test',
      name: 'Creator',
      provider: 'email',
    });
  });
  it('requires a confirmed email', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            id: 'identity-one',
            email: 'creator@example.test',
            email_confirmed_at: null,
          }),
        ),
    );
    expect(await verifier.verify('test-session')).toBeNull();
  });
  it('rejects expired sessions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 401 })),
    );
    expect(await verifier.verify('expired')).toBeNull();
  });
  it('fails closed on provider network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('network unavailable')),
    );
    expect(await verifier.verify('test-session')).toBeNull();
  });
});
