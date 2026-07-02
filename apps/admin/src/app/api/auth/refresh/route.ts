import { verifySessionToken } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_REFRESH_COOKIE } from '../../../../lib/auth/constants';
import {
  clearSessionCookies,
  issueSessionCookies,
} from '../../../../lib/auth/cookies';
import { getAuthSecret } from '../../../../lib/auth/secret';

/** Only allow same-origin path redirects (no `//host` or absolute URLs). */
function sanitizeReturnPath(path: string | null): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/admin';
}

/**
 * Rotates the session: a valid refresh token mints a new access + refresh
 * pair and redirects back to the requested admin page. The tokens are
 * stateless, so rotation replaces the pair but cannot detect reuse of an
 * old refresh token; keep TTLs short if that becomes a concern.
 */
export async function GET(request: NextRequest) {
  const secret = getAuthSecret();
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  const isValidRefresh = secret
    ? await verifySessionToken(refreshToken, secret, 'refresh')
    : false;

  if (!secret || !isValidRefresh) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    clearSessionCookies(response);
    return response;
  }

  const from = sanitizeReturnPath(request.nextUrl.searchParams.get('from'));
  const response = NextResponse.redirect(new URL(from, request.url));
  await issueSessionCookies(response, secret);
  return response;
}
