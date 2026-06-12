import { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '../../../../lib/auth/constants';

/**
 * Same-origin proxy to the tRPC API. It promotes the HttpOnly session cookie
 * to an Authorization header so the token never has to be readable by
 * client-side JavaScript.
 */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

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
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
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

  return new Response(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export { forward as GET, forward as POST };
