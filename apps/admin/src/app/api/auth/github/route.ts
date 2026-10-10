import { NextResponse } from 'next/server';
import { FixedWindowRateLimiter } from '@agentrepo/trpc/auth';
import {
  hasTrustedOrigin,
  publicRequestOrigin,
} from '../../../../lib/request-origin';
import { getAdminSupabaseClient } from '../../../../lib/auth/supabase';

const limiter = new FixedWindowRateLimiter({
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
});
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (
    !limiter.consume(
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown',
    )
  )
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  const supabase = await getAdminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user user:email',
        skipBrowserRedirect: true,
        redirectTo: new URL(
          '/api/auth/github/callback',
          publicRequestOrigin(request),
        ).toString(),
      },
    });
    if (!error && data.url) return NextResponse.redirect(data.url, 303);
  }
  return NextResponse.redirect(
    new URL('/login?error=github', publicRequestOrigin(request)),
    303,
  );
}
