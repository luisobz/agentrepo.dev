import { afterEach, expect, it, vi } from 'vitest';
import { POST } from './route';
const { client, oauth } = vi.hoisted(() => ({
  client: vi.fn(),
  oauth: vi.fn(),
}));
vi.mock('../../../../lib/auth/supabase', () => ({
  getAdminSupabaseClient: client,
}));
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
it('rejects cross-origin OAuth starts', async () => {
  expect(
    (
      await POST(
        new Request('https://admin.agentrepo.dev/api/auth/github', {
          method: 'POST',
          headers: { origin: 'https://other.example' },
        }),
      )
    ).status,
  ).toBe(403);
  expect(client).not.toHaveBeenCalled();
});
it('starts PKCE with the public admin callback behind Passenger', async () => {
  vi.stubEnv('ADMIN_APP_URL', 'https://admin.agentrepo.dev');
  oauth.mockResolvedValue({
    data: { url: 'https://project.supabase.co/auth/v1/authorize' },
    error: null,
  });
  client.mockResolvedValue({ auth: { signInWithOAuth: oauth } });
  const response = await POST(
    new Request('http://localhost:3000/api/auth/github', {
      method: 'POST',
      headers: { origin: 'https://admin.agentrepo.dev' },
    }),
  );
  expect(response.status).toBe(303);
  expect(oauth).toHaveBeenCalledWith({
    provider: 'github',
    options: {
      scopes: 'read:user user:email',
      skipBrowserRedirect: true,
      redirectTo: 'https://admin.agentrepo.dev/api/auth/github/callback',
    },
  });
});
