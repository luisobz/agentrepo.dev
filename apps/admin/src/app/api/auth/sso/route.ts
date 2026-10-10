import { hashAdminNonce } from '@agentrepo/trpc/auth';
import { NextResponse } from 'next/server';
import { hasValidAdminSession } from '../../../../lib/auth/session';
import { publicRequestOrigin } from '../../../../lib/request-origin';
import { ADMIN_SSO_COOKIE } from '../../../../lib/auth/constants';

export const dynamic = 'force-dynamic';

function privateRedirect(destination: URL) {
  const response = NextResponse.redirect(destination);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export async function GET(request: Request) {
  const origin = publicRequestOrigin(request);
  if (await hasValidAdminSession())
    return privateRedirect(new URL('/admin', origin));
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  const destination = new URL(
    '/auth/admin',
    process.env['WEB_APP_URL'] || 'https://agentrepo.dev',
  );
  destination.searchParams.set('challenge', await hashAdminNonce(nonce));
  const response = privateRedirect(destination);
  response.cookies.set(ADMIN_SSO_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 120,
  });
  return response;
}
