import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';
import { serverTrpc } from '../../../lib/trpc-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const destination = new URL(
    '/login?error=github',
    'https://admin.agentrepo.dev',
  );
  try {
    const challenge = new URL(request.url).searchParams.get('challenge') || '';
    if (/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
      const supabase = await getSupabaseServerClient();
      const session = supabase
        ? (await supabase.auth.getSession()).data.session
        : null;
      if (session) {
        const ticket = await serverTrpc.adminAuth.createHandoff.mutate({
          token: session.access_token,
          challenge,
        });
        destination.pathname = '/api/auth/sso/callback';
        destination.search = '';
        destination.searchParams.set('ticket', ticket);
      }
    }
  } catch {
    // The backend validates provider identity and the existing admin role.
  }
  const response = NextResponse.redirect(destination);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
