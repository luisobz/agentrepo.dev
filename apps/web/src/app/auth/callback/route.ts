import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

/** Only allow same-origin path redirects (no `//host` or absolute URLs). */
function sanitizeReturnPath(path: string | null): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

/**
 * OAuth code exchange: Supabase redirects here after a social login. The
 * server client writes the session cookies as HttpOnly.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = sanitizeReturnPath(request.nextUrl.searchParams.get('next'));

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(new URL('/auth/login?error=oauth', request.url));
      }
      // TODO(feature-auth): upsert the user + default `member` role in our DB.
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
