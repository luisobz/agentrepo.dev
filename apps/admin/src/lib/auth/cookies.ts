import { NextResponse } from 'next/server';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_INFO_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from './constants';

/**
 * Token payload returned by the backend adminAuth procedures. The refresh
 * fields are absent when a rotation-race grace response only re-issued the
 * access token (the existing refresh cookie stays valid in that case).
 */
export interface AdminSessionTokens {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken?: string;
  refreshExpiresAt?: Date;
}

const baseCookieOptions = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Non-sensitive session metadata the frontend is allowed to read. */
const adminInfoValue = JSON.stringify({ sub: 'admin', role: 'admin' });

function secondsUntil(expiresAt: Date): number {
  return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
}

/** Writes the HttpOnly token cookies (and info cookie) issued by the backend. */
export function applySessionCookies(
  response: NextResponse,
  tokens: AdminSessionTokens
): void {
  response.cookies.set(ADMIN_ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: secondsUntil(tokens.accessExpiresAt),
  });

  if (tokens.refreshToken && tokens.refreshExpiresAt) {
    const refreshMaxAge = secondsUntil(tokens.refreshExpiresAt);
    response.cookies.set(ADMIN_REFRESH_COOKIE, tokens.refreshToken, {
      ...baseCookieOptions,
      httpOnly: true,
      maxAge: refreshMaxAge,
    });
    response.cookies.set(ADMIN_INFO_COOKIE, adminInfoValue, {
      ...baseCookieOptions,
      httpOnly: false,
      maxAge: refreshMaxAge,
    });
  }
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
