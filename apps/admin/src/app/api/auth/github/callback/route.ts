import { NextResponse } from 'next/server';
import { publicRequestOrigin } from '../../../../../lib/request-origin';
import { getAdminSupabaseClient } from '../../../../../lib/auth/supabase';
import { backendTrpc } from '../../../../../lib/auth/backend-client';
import { applySessionCookies } from '../../../../../lib/auth/cookies';

export async function GET(request: Request) {
  const origin = publicRequestOrigin(request);
  const failure = () =>
    NextResponse.redirect(new URL('/login?error=github', origin));
  const code = new URL(request.url).searchParams.get('code');
  const supabase = await getAdminSupabaseClient();
  if (!code || !supabase) return failure();
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session) return failure();
    const tokens = await backendTrpc.adminAuth.loginWithToken.mutate({
      token: data.session.access_token,
    });
    const response = NextResponse.redirect(new URL('/admin', origin));
    applySessionCookies(response, tokens);
    return response;
  } catch {
    return failure();
  } finally {
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  }
}
