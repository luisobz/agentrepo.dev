import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { backendTrpc } from '../../../lib/auth/backend-client';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_INFO_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from '../../../lib/auth/constants';
import { GET } from './refresh/route';

vi.mock('../../../lib/auth/backend-client', () => ({
  backendTrpc: { adminAuth: { refresh: { mutate: vi.fn() } } },
}));

const refreshMutate = vi.mocked(backendTrpc.adminAuth.refresh.mutate);

function makeRequest(
  query: string,
  cookieMap: Record<string, string>
): NextRequest {
  const url = `http://localhost/api/auth/refresh${query}`;
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) =>
        name in cookieMap ? { name, value: cookieMap[name] } : undefined,
    },
  } as unknown as NextRequest;
}

function validTokens() {
  return {
    accessToken: 'new-access',
    accessExpiresAt: new Date(Date.now() + 60 * 1000),
    refreshToken: 'new-refresh',
    refreshExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

describe('GET /api/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login and clears cookies when no refresh cookie is present', async () => {
    const res = await GET(makeRequest('', {}));

    expect([307, 308]).toContain(res.status);
    expect(res.headers.get('location') ?? '').toContain('/login');
    expect(refreshMutate).not.toHaveBeenCalled();
    // cookies cleared (expired)
    expect(res.cookies.get(ADMIN_ACCESS_COOKIE)?.maxAge).toBe(0);
    expect(res.cookies.get(ADMIN_REFRESH_COOKIE)?.maxAge).toBe(0);
    expect(res.cookies.get(ADMIN_INFO_COOKIE)?.maxAge).toBe(0);
  });

  it('rotates tokens and redirects to the sanitized return path', async () => {
    refreshMutate.mockResolvedValue(validTokens());

    const res = await GET(
      makeRequest('?from=/admin/skills', {
        [ADMIN_REFRESH_COOKIE]: 'old-refresh',
      })
    );

    expect([307, 308]).toContain(res.status);
    expect(res.headers.get('location') ?? '').toContain('/admin/skills');
    expect(refreshMutate).toHaveBeenCalledWith({ refreshToken: 'old-refresh' });
    // new session cookies applied
    expect(res.cookies.get(ADMIN_ACCESS_COOKIE)?.value).toBe('new-access');
  });

  it('rejects a protocol-relative open-redirect (//evil.com) and falls back to /admin', async () => {
    refreshMutate.mockResolvedValue(validTokens());

    const res = await GET(
      makeRequest('?from=//evil.com', {
        [ADMIN_REFRESH_COOKIE]: 'old-refresh',
      })
    );

    const location = res.headers.get('location') ?? '';
    expect(location).not.toContain('evil.com');
    expect(new URL(location).pathname).toBe('/admin');
  });

  it('rejects an absolute-URL open-redirect (https://evil.com) and falls back to /admin', async () => {
    refreshMutate.mockResolvedValue(validTokens());

    const res = await GET(
      makeRequest('?from=https://evil.com', {
        [ADMIN_REFRESH_COOKIE]: 'old-refresh',
      })
    );

    const location = res.headers.get('location') ?? '';
    expect(location).not.toContain('evil.com');
    expect(new URL(location).pathname).toBe('/admin');
  });

  it('redirects to /login and clears cookies when the backend refresh throws', async () => {
    refreshMutate.mockRejectedValue(new Error('reuse detected'));

    const res = await GET(
      makeRequest('?from=/admin/skills', {
        [ADMIN_REFRESH_COOKIE]: 'old-refresh',
      })
    );

    expect([307, 308]).toContain(res.status);
    expect(res.headers.get('location') ?? '').toContain('/login');
    expect(res.cookies.get(ADMIN_ACCESS_COOKIE)?.maxAge).toBe(0);
    expect(res.cookies.get(ADMIN_REFRESH_COOKIE)?.maxAge).toBe(0);
  });
});
