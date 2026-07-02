import { FixedWindowRateLimiter, secureCompare } from '@agentrepo/trpc/auth';
import { NextResponse } from 'next/server';
import { issueSessionCookies } from '../../../../lib/auth/cookies';
import { getAuthSecret } from '../../../../lib/auth/secret';

const loginRateLimiter = new FixedWindowRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
});

function getClientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function POST(request: Request) {
  const secret = getAuthSecret();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!secret || !expectedPassword) {
    return NextResponse.json(
      { error: 'Authentication is not configured' },
      { status: 500 }
    );
  }

  const clientKey = getClientKey(request);
  if (!loginRateLimiter.consume(clientKey)) {
    return NextResponse.json(
      { error: 'Too many attempts, try again later' },
      { status: 429 }
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const password =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)['password']
      : undefined;

  if (typeof password !== 'string' || !(await secureCompare(password, expectedPassword))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  loginRateLimiter.reset(clientKey);
  const response = NextResponse.json({ ok: true });
  await issueSessionCookies(response, secret);
  return response;
}
