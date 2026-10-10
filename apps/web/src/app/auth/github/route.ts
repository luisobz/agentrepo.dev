import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
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
        request.url,
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
