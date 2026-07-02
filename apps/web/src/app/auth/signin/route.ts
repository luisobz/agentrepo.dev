import { FixedWindowRateLimiter } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signInRateLimiter = new FixedWindowRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
});

function getClientKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

/**
 * Email + password sign-in, kept server-side so the Supabase session cookies
 * are written as HttpOnly and tokens never touch client-side JavaScript.
 */
export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Authentication is not configured' },
      { status: 500 }
    );
  }

  const clientKey = getClientKey(request);
  if (!signInRateLimiter.consume(clientKey)) {
    return NextResponse.json(
      { error: 'Too many attempts, try again later' },
      { status: 429 }
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const credentials = credentialsSchema.safeParse(body);
  if (!credentials.success) {
    return NextResponse.json({ error: 'Invalid credentials payload' }, { status: 400 });
  }

  const { error } = await supabase.auth.signInWithPassword(credentials.data);
  if (error) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  signInRateLimiter.reset(clientKey);
  return NextResponse.json({ ok: true });
}
