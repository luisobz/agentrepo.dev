import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const auth = vi.hoisted(() => ({ getClaims: vi.fn(), getUser: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth }) }));
vi.mock('./lib/supabase/config', () => ({
  getSupabasePublicEnv: () => ({
    url: 'https://example.supabase.co',
    publishableKey: 'public-test',
  }),
}));
import { middleware } from './middleware';
beforeEach(() => vi.clearAllMocks());
it('anonymous navigation skips auth entirely and clears stale display information', async () => {
  const response = await middleware(
    new NextRequest('https://example.test/agents', {
      headers: { cookie: 'agentrepo_user_info=stale' },
    }),
  );
  expect(auth.getUser).not.toHaveBeenCalled();
  expect(auth.getClaims).not.toHaveBeenCalled();
  expect(response.cookies.get('agentrepo_user_info')?.value).toBe('');
});
it('uses verified claims for session refresh and display without a getUser round trip', async () => {
  auth.getClaims.mockResolvedValue({
    data: {
      claims: { sub: 'verified-user', user_metadata: { full_name: 'Alice' } },
    },
    error: null,
  });
  const response = await middleware(
    new NextRequest('https://example.test/agents', {
      headers: { cookie: 'sb-example-auth-token.0=session' },
    }),
  );
  expect(auth.getClaims).toHaveBeenCalledOnce();
  expect(auth.getUser).not.toHaveBeenCalled();
  expect(
    JSON.parse(response.cookies.get('agentrepo_user_info')!.value),
  ).toMatchObject({ userId: 'verified-user', name: 'Alice' });
});
it('invalid claims never populate user display data', async () => {
  auth.getClaims.mockResolvedValue({
    data: null,
    error: { message: 'invalid' },
  });
  const response = await middleware(
    new NextRequest('https://example.test/agents', {
      headers: {
        cookie: 'sb-example-auth-token=session; agentrepo_user_info=stale',
      },
    }),
  );
  expect(response.cookies.get('agentrepo_user_info')?.value).toBe('');
});
