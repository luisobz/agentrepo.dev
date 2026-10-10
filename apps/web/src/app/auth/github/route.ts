import {
  hasTrustedOrigin,
  publicRequestOrigin,
} from '../../../lib/request-origin';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase)
    return NextResponse.json(
      { error: 'Authentication unavailable' },
      { status: 503 },
    );
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'read:user user:email',
      redirectTo: new URL(
        '/auth/callback?next=/creator',
        publicRequestOrigin(request),
      ).toString(),
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url)
    return NextResponse.json(
      { error: 'Could not start GitHub sign-in' },
      { status: 502 },
    );
  return NextResponse.json({ url: data.url });
}
