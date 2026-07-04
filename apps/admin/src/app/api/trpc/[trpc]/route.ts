import { verifySessionToken } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import { backendTrpc } from '../../../../lib/auth/backend-client';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from '../../../../lib/auth/constants';
import {
  AdminSessionTokens,
  applySessionCookies,
} from '../../../../lib/auth/cookies';
import { getAuthSecret } from '../../../../lib/auth/secret';

/**
 * Same-origin proxy to the tRPC API. It promotes the HttpOnly session cookie
 * to an Authorization header so the token never has to be readable by
 * client-side JavaScript. An expired access token is refreshed against the
 * backend (rotating the pair) so in-page API calls survive the short access
 * TTL; the rotation grace window absorbs parallel calls racing the refresh.
 */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

interface ResolvedSession {
  accessToken: string;
  /** Present only when the pair was just refreshed and cookies must be updated. */
  refreshedTokens?: AdminSessionTokens;
}

async function resolveSession(request: NextRequest): Promise<ResolvedSession | null> {
  const secret = getAuthSecret();
  if (!secret) {
    return null;
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (accessToken && (await verifySessionToken(accessToken, secret))) {
    return { accessToken };
  }

  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }
  try {
    const refreshedTokens = await backendTrpc.adminAuth.refresh.mutate({ refreshToken });
    return { accessToken: refreshedTokens.accessToken, refreshedTokens };
  } catch {
    return null;
  }
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
  const session = await resolveSession(request);
  if (session) {
    headers.set('authorization', `Bearer ${session.accessToken}`);
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
  if (session?.refreshedTokens) {
    applySessionCookies(proxied, session.refreshedTokens);
  }
  return proxied;
}

export { forward as GET, forward as POST };
