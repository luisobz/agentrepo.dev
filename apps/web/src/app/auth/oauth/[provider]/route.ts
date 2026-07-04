import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';

const SOCIAL_PROVIDERS = ['github', 'google', 'apple'] as const;
type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}

/** Only allow same-origin path redirects (no `//host` or absolute URLs). */
function sanitizeReturnPath(path: string | null): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

/**
 * Starts the OAuth flow server-side: the PKCE code verifier cookie is
 * written HttpOnly here, and the browser is redirected to the provider.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (!isSocialProvider(provider)) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Authentication is not configured' },
      { status: 500 }
    );
  }

  const next = sanitizeReturnPath(request.nextUrl.searchParams.get('next'));
  const callbackUrl = new URL('/auth/callback', request.nextUrl.origin);
  callbackUrl.searchParams.set('next', next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth', request.url));
  }

  return NextResponse.redirect(data.url);
}
