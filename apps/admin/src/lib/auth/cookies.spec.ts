import { NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_INFO_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from './constants';
import {
  applySessionCookies,
  clearSessionCookies,
  type AdminSessionTokens,
} from './cookies';

function inFuture(ms: number): Date {
  return new Date(Date.now() + ms);
}

describe('applySessionCookies', () => {
  it('sets access (httpOnly), refresh (httpOnly), and info (readable) cookies with both tokens', () => {
    const res = NextResponse.json({});
    const tokens: AdminSessionTokens = {
      accessToken: 'access-token-value',
      accessExpiresAt: inFuture(60 * 1000),
      refreshToken: 'refresh-token-value',
      refreshExpiresAt: inFuture(60 * 60 * 1000),
    };

    applySessionCookies(res, tokens);

    const access = res.cookies.get(ADMIN_ACCESS_COOKIE);
    expect(access?.value).toBe('access-token-value');
    expect(access?.httpOnly).toBe(true);
    expect(access?.maxAge).toBeGreaterThan(0);

    const refresh = res.cookies.get(ADMIN_REFRESH_COOKIE);
    expect(refresh?.value).toBe('refresh-token-value');
    expect(refresh?.httpOnly).toBe(true);

    const info = res.cookies.get(ADMIN_INFO_COOKIE);
    expect(info).toBeDefined();
    expect(info?.httpOnly).toBe(false);
    expect(info?.value).toContain('admin');
  });

  it('sets only the access cookie in the rotation-grace path (no refreshToken)', () => {
    const res = NextResponse.json({});
    const tokens: AdminSessionTokens = {
      accessToken: 'access-only',
      accessExpiresAt: inFuture(60 * 1000),
    };

    applySessionCookies(res, tokens);

    const access = res.cookies.get(ADMIN_ACCESS_COOKIE);
    expect(access?.value).toBe('access-only');
    expect(access?.httpOnly).toBe(true);

    // Refresh + info cookies must NOT be written in the grace path.
    expect(res.cookies.get(ADMIN_REFRESH_COOKIE)).toBeUndefined();
    expect(res.cookies.get(ADMIN_INFO_COOKIE)).toBeUndefined();
  });

  it('does not write refresh/info if only refreshExpiresAt is present without refreshToken', () => {
    const res = NextResponse.json({});
    const tokens: AdminSessionTokens = {
      accessToken: 'access-only',
      accessExpiresAt: inFuture(60 * 1000),
      refreshExpiresAt: inFuture(60 * 60 * 1000),
    };

    applySessionCookies(res, tokens);

    expect(res.cookies.get(ADMIN_ACCESS_COOKIE)?.value).toBe('access-only');
    expect(res.cookies.get(ADMIN_REFRESH_COOKIE)).toBeUndefined();
    expect(res.cookies.get(ADMIN_INFO_COOKIE)).toBeUndefined();
  });
});

describe('clearSessionCookies', () => {
  it('expires all three cookies (empty value, maxAge 0)', () => {
    const res = NextResponse.json({});

    clearSessionCookies(res);

    for (const name of [
      ADMIN_ACCESS_COOKIE,
      ADMIN_REFRESH_COOKIE,
      ADMIN_INFO_COOKIE,
    ]) {
      const cookie = res.cookies.get(name);
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBe('');
      expect(cookie?.maxAge).toBe(0);
    }

    expect(res.cookies.get(ADMIN_ACCESS_COOKIE)?.httpOnly).toBe(true);
    expect(res.cookies.get(ADMIN_REFRESH_COOKIE)?.httpOnly).toBe(true);
    expect(res.cookies.get(ADMIN_INFO_COOKIE)?.httpOnly).toBe(false);
  });
});
