import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GET } from './route';
import { ADMIN_ACCESS_COOKIE } from '../../../../../lib/auth/constants';
const { client, exchange, signOut, login } = vi.hoisted(() => ({
  client: vi.fn(),
  exchange: vi.fn(),
  signOut: vi.fn(),
  login: vi.fn(),
}));
vi.mock('../../../../../lib/auth/supabase', () => ({
  getAdminSupabaseClient: client,
}));
vi.mock('../../../../../lib/auth/backend-client', () => ({
  backendTrpc: { adminAuth: { loginWithToken: { mutate: login } } },
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('ADMIN_APP_URL', 'https://admin.agentrepo.dev');
  client.mockResolvedValue({
    auth: { exchangeCodeForSession: exchange, signOut },
  });
  signOut.mockResolvedValue({ error: null });
  exchange.mockResolvedValue({
    data: { session: { access_token: 'verified-provider-token' } },
    error: null,
  });
});
afterEach(() => vi.unstubAllEnvs());
it('creates a host-only admin session only after backend approval', async () => {
  login.mockResolvedValue({
    accessToken: 'admin-access',
    accessExpiresAt: new Date(Date.now() + 60000),
    refreshToken: 'admin-refresh',
    refreshExpiresAt: new Date(Date.now() + 120000),
  });
  const response = await GET(
    new Request('http://localhost:3000/api/auth/github/callback?code=one-time'),
  );
  expect(response.headers.get('location')).toBe(
    'https://admin.agentrepo.dev/admin',
  );
  expect(login).toHaveBeenCalledWith({ token: 'verified-provider-token' });
  expect(response.cookies.get(ADMIN_ACCESS_COOKIE)?.value).toBe('admin-access');
  expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
});
it('denies an authenticated GitHub contributor without admin privileges', async () => {
  login.mockRejectedValue(new Error('Denied'));
  const response = await GET(
    new Request(
      'https://admin.agentrepo.dev/api/auth/github/callback?code=one-time',
    ),
  );
  expect(response.headers.get('location')).toBe(
    'https://admin.agentrepo.dev/login?error=github',
  );
  expect(response.cookies.get(ADMIN_ACCESS_COOKIE)).toBeUndefined();
  expect(signOut).toHaveBeenCalled();
});
it('never creates an admin session when the OAuth code is invalid', async () => {
  exchange.mockResolvedValue({
    data: { session: null },
    error: { message: 'Invalid code' },
  });
  const response = await GET(
    new Request(
      'https://admin.agentrepo.dev/api/auth/github/callback?code=invalid',
    ),
  );
  expect(response.cookies.get(ADMIN_ACCESS_COOKIE)).toBeUndefined();
  expect(login).not.toHaveBeenCalled();
});
