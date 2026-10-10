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
  serverTrpc: { adminAuth: { checkAccess: { mutate } } },
}));
beforeEach(() => vi.resetAllMocks());
it('hides the shortcut without a session and prevents shared caching', async () => {
  client.mockResolvedValue(null);
  const response = await GET();
  expect(await response.json()).toEqual({ isAdmin: false });
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(mutate).not.toHaveBeenCalled();
});
it.each([true, false])(
  'uses the server-verified role (%s) without exposing tokens',
  async (isAdmin) => {
    client.mockResolvedValue({
      auth: {
        getSession: async () => ({
          data: { session: { access_token: 'private-token' } },
        }),
      },
    });
    mutate.mockResolvedValue(isAdmin);
    const response = await GET();
    expect(await response.json()).toEqual({ isAdmin });
    expect(mutate).toHaveBeenCalledWith({ token: 'private-token' });
  },
);
it('fails closed if role verification fails', async () => {
  client.mockRejectedValue(new TypeError('offline'));
  expect(await (await GET()).json()).toEqual({ isAdmin: false });
});
