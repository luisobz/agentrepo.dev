import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createAdminHandoff, hashAdminNonce } from '@agentrepo/trpc/auth';
import { GET } from './route';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_SSO_COOKIE,
} from '../../../../../lib/auth/constants';
const { login, store } = vi.hoisted(() => ({ login: vi.fn(), store: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: store }));
vi.mock('../../../../../lib/auth/backend-client', () => ({
  backendTrpc: { adminAuth: { loginWithToken: { mutate: login } } },
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('AUTH_SECRET', 'test-secret');
  vi.stubEnv('ADMIN_APP_URL', 'https://admin.agentrepo.dev');
  store.mockResolvedValue({ get: () => ({ value: 'private-browser-nonce' }) });
  login.mockResolvedValue({
    accessToken: 'admin-access',
    accessExpiresAt: new Date(Date.now() + 60_000),
    refreshToken: 'refresh',
    refreshExpiresAt: new Date(Date.now() + 120_000),
  });
});
afterEach(() => vi.unstubAllEnvs());
async function callback() {
  const ticket = await createAdminHandoff({
    token: 'verified-provider-token',
    challenge: await hashAdminNonce('private-browser-nonce'),
    secret: 'test-secret',
  });
  return GET(
    new Request(
      `http://localhost:3000/api/auth/sso/callback?ticket=${encodeURIComponent(ticket)}`,
    ),
  );
}
it('rechecks the admin role, creates host-only cookies and clears the private nonce', async () => {
  const response = await callback();
  expect(login).toHaveBeenCalledWith({ token: 'verified-provider-token' });
  expect(response.headers.get('location')).toBe(
    'https://admin.agentrepo.dev/admin',
  );
  expect(response.cookies.get(ADMIN_ACCESS_COOKIE)?.value).toBe('admin-access');
  expect(response.cookies.get(ADMIN_SSO_COOKIE)?.maxAge).toBe(0);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
});
it('rejects a captured URL in a different browser or after nonce consumption', async () => {
  store.mockResolvedValue({ get: () => undefined });
  const response = await callback();
  expect(login).not.toHaveBeenCalled();
  expect(response.cookies.get(ADMIN_ACCESS_COOKIE)).toBeUndefined();
  expect(response.headers.get('location')).toBe(
    'https://admin.agentrepo.dev/login?error=github',
  );
});
it('fails closed if the admin role was revoked during the redirect', async () => {
  login.mockRejectedValue(new TypeError('Denied'));
  expect((await callback()).cookies.get(ADMIN_ACCESS_COOKIE)).toBeUndefined();
});
