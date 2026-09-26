import { FixedWindowRateLimiter } from '@agentrepo/trpc/auth';
import { NextResponse } from 'next/server';
import { backendTrpc } from '../../../../lib/auth/backend-client';
import { applySessionCookies } from '../../../../lib/auth/cookies';

const loginRateLimiter = new FixedWindowRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
});

function getClientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (!loginRateLimiter.consume(clientKey)) {
    return NextResponse.json(
      { error: 'Too many attempts, try again later' },
      { status: 429 }
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const fields =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const email = fields['email'];
  const password = fields['password'];

  if (typeof email !== 'string' || !email || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const tokens = await backendTrpc.adminAuth.login.mutate({ email, password });
    loginRateLimiter.reset(clientKey);
    const response = NextResponse.json({ ok: true });
    applySessionCookies(response, tokens);
    return response;
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'data' in error
        ? (error as { data?: { code?: string } }).data?.code
        : undefined;
    if (code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 502 }
    );
  }
}
