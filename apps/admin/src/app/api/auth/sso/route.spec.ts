import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { hashAdminNonce } from '@agentrepo/trpc/auth';
import { GET } from './route';
import { ADMIN_SSO_COOKIE } from '../../../../lib/auth/constants';
const { valid } = vi.hoisted(() => ({ valid: vi.fn() }));
vi.mock('../../../../lib/auth/session', () => ({
  hasValidAdminSession: valid,
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('ADMIN_APP_URL', 'https://admin.agentrepo.dev');
});
afterEach(() => vi.unstubAllEnvs());
it('only exposes a hash of the private HttpOnly nonce in the cross-domain redirect', async () => {
  valid.mockResolvedValue(false);
  const response = await GET(new Request('http://localhost:3000/api/auth/sso'));
  const cookie = response.cookies.get(ADMIN_SSO_COOKIE);
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.domain).toBeUndefined();
  expect(cookie?.value).toHaveLength(64);
  const destination = new URL(response.headers.get('location') || '');
  expect(destination.origin).toBe('https://agentrepo.dev');
  expect(destination.searchParams.get('challenge')).toBe(
    await hashAdminNonce(cookie?.value || ''),
  );
  expect(response.headers.get('location')).not.toContain(cookie?.value);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
it('reuses an existing valid admin session directly', async () => {
  valid.mockResolvedValue(true);
  expect(
    (
      await GET(new Request('https://admin.agentrepo.dev/api/auth/sso'))
    ).headers.get('location'),
  ).toBe('https://admin.agentrepo.dev/admin');
});
