import { NextResponse } from 'next/server';
import { AUTH_COOKIE_OPTIONS, USER_INFO_COOKIE } from '../../../lib/auth/cookie-options';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST() {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(USER_INFO_COOKIE, '', {
    ...AUTH_COOKIE_OPTIONS,
    httpOnly: false,
    maxAge: 0,
  });
  return response;
}
