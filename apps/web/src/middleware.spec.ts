import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const auth = vi.hoisted(() => ({
  getClaims: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
}));
const { checkAccess } = vi.hoisted(() => ({ checkAccess: vi.fn() }));
vi.mock('./lib/trpc-server', () => ({
  serverTrpc: { adminAuth: { checkAccess: { mutate: checkAccess } } },
}));
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

it('cuts off anonymous draft previews before rendering, with private and noindex headers', async () => {
  const response = await middleware(
    new NextRequest('https://example.test/blog/review/private-id'),
  );
  expect(response.status).toBe(404);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  expect(checkAccess).not.toHaveBeenCalled();
});

it.each([false, true])(
  'requires the backend role check for preview access (%s), not user-editable metadata',
  async (allowed) => {
    auth.getClaims.mockResolvedValue({
      data: { claims: { sub: 'member', user_metadata: { role: 'admin' } } },
      error: null,
    });
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'provider-credential' } },
    });
    checkAccess.mockResolvedValue(allowed);
    const response = await middleware(
      new NextRequest('https://example.test/blog/review', {
        headers: { cookie: 'sb-example-auth-token=session' },
      }),
    );
    expect(checkAccess).toHaveBeenCalledWith({ token: 'provider-credential' });
    expect(response.status).toBe(allowed ? 200 : 404);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  },
);

it('fails closed if role verification is unavailable', async () => {
  auth.getClaims.mockResolvedValue({
    data: { claims: { sub: 'member' } },
    error: null,
  });
  auth.getSession.mockResolvedValue({
    data: { session: { access_token: 'provider-credential' } },
  });
  checkAccess.mockRejectedValue(new TypeError('offline'));
  const response = await middleware(
    new NextRequest('https://example.test/blog/review', {
      headers: { cookie: 'sb-example-auth-token=session' },
    }),
  );
  expect(response.status).toBe(404);
});

it.each([
  '/skills/private',
  '/skills/private/new',
  '/skills/private/unknown/edit',
])('blocks anonymous private skills before rendering: %s', async (path) => {
  const response = await middleware(
    new NextRequest(`https://example.test${path}`),
  );
  expect(response.status).toBe(404);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  expect(checkAccess).not.toHaveBeenCalled();
});
