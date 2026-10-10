import { beforeEach, expect, it, vi } from 'vitest';
import { GET } from './route';
const { client, mutate } = vi.hoisted(() => ({
  client: vi.fn(),
  mutate: vi.fn(),
}));
vi.mock('../../../lib/supabase/server', () => ({
  getSupabaseServerClient: client,
}));
vi.mock('../../../lib/trpc-server', () => ({
  serverTrpc: { adminAuth: { createHandoff: { mutate } } },
}));
beforeEach(() => vi.resetAllMocks());
const request = () =>
  new Request(`https://agentrepo.dev/auth/admin?challenge=${'a'.repeat(43)}`);
it('redirects the existing web session through the backend role check without another OAuth login', async () => {
  client.mockResolvedValue({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'private-token' } },
      }),
    },
  });
  mutate.mockResolvedValue('encrypted-browser-bound-ticket');
  const response = await GET(request());
  expect(mutate).toHaveBeenCalledWith({
    token: 'private-token',
    challenge: 'a'.repeat(43),
  });
  expect(response.headers.get('location')).toBe(
    'https://admin.agentrepo.dev/api/auth/sso/callback?ticket=encrypted-browser-bound-ticket',
  );
  expect(response.headers.get('location')).not.toContain('private-token');
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
it('falls back to login for anonymous visitors', async () => {
  client.mockResolvedValue(null);
  expect((await GET(request())).headers.get('location')).toBe(
    'https://admin.agentrepo.dev/login?error=github',
  );
  expect(mutate).not.toHaveBeenCalled();
});
it('does not trust an unvalidated challenge or a caller-supplied redirect', async () => {
  const response = await GET(
    new Request(
      'https://agentrepo.dev/auth/admin?challenge=invalid&redirect=https://other.example',
    ),
  );
  expect(client).not.toHaveBeenCalled();
  expect(response.headers.get('location')).toBe(
    'https://admin.agentrepo.dev/login?error=github',
  );
});
