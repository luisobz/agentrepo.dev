import { createSessionToken, verifySessionToken } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACCESS_TTL_MS,
  ADMIN_REFRESH_COOKIE,
} from '../../../../lib/auth/constants';
import { setAccessCookie } from '../../../../lib/auth/cookies';
import { getAuthSecret } from '../../../../lib/auth/secret';

/**
 * Same-origin proxy to the tRPC API. It promotes the HttpOnly session cookie
 * to an Authorization header so the token never has to be readable by
 * client-side JavaScript. An expired access token is re-minted inline from a
 * valid refresh token so in-page API calls survive the short access TTL.
 */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

interface ResolvedAccessToken {
  token: string | undefined;
  rotated: boolean;
}

async function resolveAccessToken(request: NextRequest): Promise<ResolvedAccessToken> {
  const secret = getAuthSecret();
  if (!secret) {
    return { token: undefined, rotated: false };
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (await verifySessionToken(accessToken, secret)) {
    return { token: accessToken, rotated: false };
  }

  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (await verifySessionToken(refreshToken, secret, 'refresh')) {
    return {
      token: await createSessionToken(secret, ADMIN_ACCESS_TTL_MS, 'access'),
      rotated: true,
    };
  }

  return { token: undefined, rotated: false };
}

async function forward(
  request: NextRequest,
  { params }: { params: Promise<{ trpc: string }> }
) {
  const { trpc } = await params;
  const search = request.nextUrl.search;
  const target = `${API_BASE}/api/trpc/${trpc}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  const { token, rotated } = await resolveAccessToken(request);
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }

  const isBodyless = request.method === 'GET' || request.method === 'HEAD';
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: isBodyless ? undefined : await request.text(),
    cache: 'no-store',
  });

  const proxied = new NextResponse(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  });
  if (token && rotated) {
    setAccessCookie(proxied, token);
  }
  return proxied;
}

export { forward as GET, forward as POST };
