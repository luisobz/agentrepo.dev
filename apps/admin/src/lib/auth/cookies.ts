import { createSessionToken } from '@agentrepo/trpc/auth';
import { NextResponse } from 'next/server';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACCESS_TTL_MS,
  ADMIN_INFO_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_REFRESH_TTL_MS,
} from './constants';

const baseCookieOptions = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Non-sensitive session metadata the frontend is allowed to read. */
const adminInfoValue = JSON.stringify({ sub: 'admin', role: 'admin' });

export function setAccessCookie(response: NextResponse, accessToken: string): void {
  response.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: ADMIN_ACCESS_TTL_MS / 1000,
  });
}

/**
 * Issues a fresh access + refresh token pair (HttpOnly) plus the JS-readable
 * info cookie. Called at login and on every refresh rotation.
 */
export async function issueSessionCookies(
  response: NextResponse,
  secret: string
): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    createSessionToken(secret, ADMIN_ACCESS_TTL_MS, 'access'),
    createSessionToken(secret, ADMIN_REFRESH_TTL_MS, 'refresh'),
  ]);

  setAccessCookie(response, accessToken);
  response.cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: ADMIN_REFRESH_TTL_MS / 1000,
  });
  response.cookies.set(ADMIN_INFO_COOKIE, adminInfoValue, {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: ADMIN_REFRESH_TTL_MS / 1000,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  for (const name of [ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE]) {
    response.cookies.set(name, '', {
      ...baseCookieOptions,
      httpOnly: true,
      maxAge: 0,
    });
  }
  response.cookies.set(ADMIN_INFO_COOKIE, '', {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: 0,
  });
}
