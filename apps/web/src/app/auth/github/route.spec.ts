import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { signInWithOAuth, client } = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  client: vi.fn(),
}));
vi.mock('../../../lib/supabase/server', () => ({
  getSupabaseServerClient: client,
}));
const request = (origin = 'https://agentrepo.dev') =>
  new NextRequest('https://agentrepo.dev/auth/github', {
    method: 'POST',
    headers: { origin },
  });

describe('GitHub creator sign-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.mockResolvedValue({ auth: { signInWithOAuth } });
  });
  it('starts server-side OAuth with a fixed local callback and minimum profile scopes', async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: 'https://project.supabase.co/auth/v1/authorize' },
      error: null,
    });
    expect((await POST(request())).status).toBe(200);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: {
        scopes: 'read:user user:email',
        redirectTo: 'https://agentrepo.dev/auth/callback?next=/creator',
        skipBrowserRedirect: true,
      },
    });
  });
  it('rejects cross-origin initiation before touching authentication', async () => {
    expect((await POST(request('https://evil.test'))).status).toBe(403);
    expect(client).not.toHaveBeenCalled();
  });
  it('fails clearly if authentication is unavailable', async () => {
    client.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(503);
  });
  it('does not expose provider errors', async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: 'private details' },
    });
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private details');
  });
});

afterEach(() => vi.unstubAllEnvs());
it('uses the public callback behind Passenger instead of its internal URL', async () => {
  vi.stubEnv('WEB_APP_URL', 'https://agentrepo.dev');
  signInWithOAuth.mockResolvedValue({
    data: { url: 'https://project.supabase.co/auth/v1/authorize' },
    error: null,
  });
  const proxyRequest = new NextRequest('http://127.0.0.1:3000/auth/github', {
    method: 'POST',
    headers: { origin: 'https://agentrepo.dev' },
  });
  expect((await POST(proxyRequest)).status).toBe(200);
  expect(signInWithOAuth).toHaveBeenLastCalledWith(
    expect.objectContaining({
      options: expect.objectContaining({
        redirectTo: 'https://agentrepo.dev/auth/callback?next=/creator',
      }),
    }),
  );
});
