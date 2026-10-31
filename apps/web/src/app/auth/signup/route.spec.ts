import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { POST } from './route';
const { signUp, client } = vi.hoisted(() => ({
  signUp: vi.fn(),
  client: vi.fn(),
}));
vi.mock('../../../lib/supabase/server', () => ({
  getSupabaseServerClient: client,
}));
beforeEach(() => {
  vi.clearAllMocks();
  client.mockResolvedValue({ auth: { signUp } });
  signUp.mockResolvedValue({ error: null });
});
function request(contributionType: string) {
  return new NextRequest('https://agentrepo.dev/auth/signup', {
    method: 'POST',
    headers: {
      origin: 'https://agentrepo.dev',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: 'contributor@example.com',
      password: 'test-only-password',
      contributionType,
    }),
  });
}
it('retains a valid article proposal after email confirmation without passing UI fields to Auth', async () => {
  expect((await POST(request('blog'))).status).toBe(200);
  const payload = signUp.mock.lastCall?.[0];
  expect(payload).not.toHaveProperty('contributionType');
  const callback = new URL(payload.options.emailRedirectTo);
  expect(callback.origin).toBe('https://agentrepo.dev');
  expect(callback.searchParams.get('next')).toBe('/creator?type=blog');
});
it('rejects an untrusted destination before calling the provider', async () => {
  expect((await POST(request('https://evil.test'))).status).toBe(400);
  expect(signUp).not.toHaveBeenCalled();
});
