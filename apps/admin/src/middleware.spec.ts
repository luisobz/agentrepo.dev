import { verifySessionToken } from '@agentrepo/trpc/auth';
import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from './lib/auth/constants';
import { middleware } from './middleware';

vi.mock('@agentrepo/trpc/auth', () => ({ verifySessionToken: vi.fn() }));

const verifyMock = vi.mocked(verifySessionToken);

function makeRequest(
  pathname: string,
  cookieMap: Record<string, string>
): NextRequest {
  return {
    cookies: {
      get: (name: string) =>
        name in cookieMap ? { name, value: cookieMap[name] } : undefined,
    },
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
  } as unknown as NextRequest;
}

describe('middleware', () => {
  const original = process.env.AUTH_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = original;
    }
  });

  it('redirects to /api/auth/refresh when /admin has no valid access but a refresh cookie', async () => {
    process.env.AUTH_SECRET = 'secret';
    verifyMock.mockResolvedValue(false);
    const req = makeRequest('/admin/settings', {
      [ADMIN_REFRESH_COOKIE]: 'refresh-token',
    });

    const res = await middleware(req);

    expect([307, 308]).toContain(res.status);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/api/auth/refresh');
    expect(location).toContain('from=');
    expect(location).toContain('%2Fadmin%2Fsettings');
  });

  it('redirects to /login when /admin has no valid access and no refresh cookie', async () => {
    process.env.AUTH_SECRET = 'secret';
    verifyMock.mockResolvedValue(false);
    const req = makeRequest('/admin/settings', {});

    const res = await middleware(req);

    expect([307, 308]).toContain(res.status);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/login');
    expect(location).toContain('from=');
  });

  it('redirects /login to /admin when access is valid', async () => {
    process.env.AUTH_SECRET = 'secret';
    verifyMock.mockResolvedValue(true);
    const req = makeRequest('/login', {
      [ADMIN_ACCESS_COOKIE]: 'valid-token',
    });

    const res = await middleware(req);

    expect([307, 308]).toContain(res.status);
    expect(res.headers.get('location') ?? '').toContain('/admin');
  });

  it('passes through (next) when /admin has valid access', async () => {
    process.env.AUTH_SECRET = 'secret';
    verifyMock.mockResolvedValue(true);
    const req = makeRequest('/admin', {
      [ADMIN_ACCESS_COOKIE]: 'valid-token',
    });

    const res = await middleware(req);

    // NextResponse.next() is a 200 pass-through, not a redirect.
    expect(res.headers.get('location')).toBeNull();
    expect(res.status).toBe(200);
  });
});
