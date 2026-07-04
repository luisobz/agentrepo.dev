import { NextRequest, NextResponse } from 'next/server';
import { backendTrpc } from '../../../../lib/auth/backend-client';
import { ADMIN_REFRESH_COOKIE } from '../../../../lib/auth/constants';
import {
  applySessionCookies,
  clearSessionCookies,
} from '../../../../lib/auth/cookies';

/** Only allow same-origin path redirects (no `//host` or absolute URLs). */
function sanitizeReturnPath(path: string | null): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/admin';
}

/**
 * Rotates the session server-side: the backend revokes the presented refresh
 * token and returns a new pair (or rejects it, revoking the whole family on
 * reuse). Then the request continues to the admin page it came from.
 */
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    clearSessionCookies(response);
    return response;
  }

  try {
    const tokens = await backendTrpc.adminAuth.refresh.mutate({ refreshToken });
    const from = sanitizeReturnPath(request.nextUrl.searchParams.get('from'));
    const response = NextResponse.redirect(new URL(from, request.url));
    applySessionCookies(response, tokens);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    clearSessionCookies(response);
    return response;
  }
}
