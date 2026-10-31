import { contributionHref } from '../../../lib/contribution';
import {
  hasTrustedOrigin,
  publicRequestOrigin,
} from '../../../lib/request-origin';
import { FixedWindowRateLimiter } from '@agentrepo/trpc/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

const signupSchema = z.object({
  contributionType: z.enum(['skill', 'agent', 'blog']).optional(),
  email: z.email(),
  password: z.string().min(10).max(128),
});
const signupLimiter = new FixedWindowRateLimiter({
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000,
});

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const clientKey =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!signupLimiter.consume(clientKey)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 400 },
    );
  const supabase = await getSupabaseServerClient();
  if (!supabase)
    return NextResponse.json(
      { error: 'Authentication unavailable' },
      { status: 503 },
    );
  const { contributionType, ...credentials } = parsed.data;
  const callbackPath = contributionType
    ? '/auth/callback?next=' +
      encodeURIComponent(contributionHref(contributionType))
    : '/auth/callback?next=/creator';
  const { error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      emailRedirectTo: new URL(
        callbackPath,
        publicRequestOrigin(request),
      ).toString(),
    },
  });
  if (error)
    return NextResponse.json(
      { error: 'Could not register this account' },
      { status: 400 },
    );
  return NextResponse.json({ ok: true });
}
