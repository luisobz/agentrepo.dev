import { openAdminHandoff } from '@agentrepo/trpc/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendTrpc } from '../../../../../lib/auth/backend-client';
import { applySessionCookies } from '../../../../../lib/auth/cookies';
import { getAuthSecret } from '../../../../../lib/auth/secret';
import { publicRequestOrigin } from '../../../../../lib/request-origin';
import { ADMIN_SSO_COOKIE } from '../../../../../lib/auth/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = publicRequestOrigin(request);
  const response = NextResponse.redirect(
    new URL('/login?error=github', origin),
  );
  response.cookies.set(ADMIN_SSO_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  try {
    const nonce = (await cookies()).get(ADMIN_SSO_COOKIE)?.value || '';
    const ticket = new URL(request.url).searchParams.get('ticket') || '';
    const token = await openAdminHandoff(ticket, nonce, getAuthSecret() || '');
    if (!token) return response;
    const tokens = await backendTrpc.adminAuth.loginWithToken.mutate({ token });
    applySessionCookies(response, tokens);
    response.headers.set('Location', new URL('/admin', origin).toString());
  } catch {
    // Missing sessions, expired bridges and revoked roles all fail closed.
  }
  return response;
}
