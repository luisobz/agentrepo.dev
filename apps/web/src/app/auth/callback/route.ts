import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';
import { safeReturnPath } from '../../../lib/auth/return-path';

/**
 * OAuth code exchange: Supabase redirects here after a social login. The
 * server client writes the session cookies as HttpOnly.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeReturnPath(request.nextUrl.searchParams.get('next'));

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(
          new URL('/auth/login?error=oauth', request.url),
        );
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=oauth', request.url));
}
