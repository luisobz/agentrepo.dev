import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as login } from '../../app/api/auth/login/route';
import { POST as logout } from '../../app/api/auth/logout/route';
import { POST as proxy } from '../../app/api/trpc/[trpc]/route';

afterEach(() => vi.restoreAllMocks());

describe('admin mutation origins', () => {
  it('rejects a cross-origin login before authentication', async () => {
    const request = new NextRequest(
      'https://admin.agentrepo.dev/api/auth/login',
      {
        method: 'POST',
        headers: { origin: 'https://other.example' },
        body: '{}',
      },
    );
    expect((await login(request)).status).toBe(403);
  });
  it('rejects a cross-origin logout before changing the session', async () => {
    const request = new NextRequest(
      'https://admin.agentrepo.dev/api/auth/logout',
      { method: 'POST', headers: { origin: 'https://other.example' } },
    );
    expect((await logout(request)).status).toBe(403);
  });
  it('does not forward cross-origin editorial mutations', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}'));
    const request = new NextRequest(
      'https://admin.agentrepo.dev/api/trpc/skills.admin.update',
      {
        method: 'POST',
        headers: { origin: 'https://other.example' },
        body: '{}',
      },
    );
    expect(
      (
        await proxy(request, {
          params: Promise.resolve({ trpc: 'skills.admin.update' }),
        })
      ).status,
    ).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
});
