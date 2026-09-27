import { FixedWindowRateLimiter } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(10).max(128),
});
const signupLimiter = new FixedWindowRateLimiter({ maxAttempts: 5, windowMs: 60 * 60 * 1000 });

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!signupLimiter.consume(clientKey)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 });
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: new URL('/auth/callback?next=/creator', request.url).toString() },
  });
  if (error) return NextResponse.json({ error: 'Could not register this account' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
