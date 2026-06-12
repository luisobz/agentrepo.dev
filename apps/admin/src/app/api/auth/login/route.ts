import { createSessionToken } from '@agentrepo/trpc/auth';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_MS } from '../../../../lib/auth/constants';
import { getAuthSecret } from '../../../../lib/auth/session';

export async function POST(request: Request) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not configured' },
      { status: 500 }
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const password =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)['password']
      : undefined;

  if (typeof password !== 'string' || password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await createSessionToken(getAuthSecret(), ADMIN_SESSION_TTL_MS);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
  return response;
}
