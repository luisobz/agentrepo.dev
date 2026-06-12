import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from './lib/auth/constants';

/**
 * Cheap cookie-presence gate. The signature is verified server-side in the
 * /admin layout and on every API call, so a forged cookie only reaches an
 * empty shell.
 */
export function middleware(request: NextRequest) {
  const hasSessionCookie = Boolean(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && hasSessionCookie) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
