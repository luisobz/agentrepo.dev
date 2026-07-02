import { verifySessionToken } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from './lib/auth/constants';

/**
 * Verifies the access token signature at the edge. When it is missing or
 * expired but a refresh cookie exists, the request detours through
 * /api/auth/refresh, which rotates the pair and redirects back.
 */
export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const hasValidAccess = secret
    ? await verifySessionToken(accessToken, secret)
    : false;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !hasValidAccess) {
    if (request.cookies.get(ADMIN_REFRESH_COOKIE)?.value) {
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      refreshUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(refreshUrl);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && hasValidAccess) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
