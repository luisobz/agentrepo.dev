import {
  prepareLocaleRequest,
  finishLocaleResponse,
} from './lib/i18n/request-routing';
import { createServerClient } from '@supabase/ssr';
import { routePublicSkill } from './lib/skill-routing';
import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_OPTIONS,
  USER_INFO_COOKIE,
} from './lib/auth/cookie-options';
import {
  serializeUserInfo,
  publicUserInfoFromClaims,
} from './lib/auth/user-info';
import { getSupabasePublicEnv } from './lib/supabase/config';
import { serverTrpc } from './lib/trpc-server';

/**
 * Keeps the Supabase session alive server-side: getClaims() verifies signatures and refreshes expired
 * access tokens with the HttpOnly refresh cookie, and the JS-readable
 * user-info cookie is kept in sync with the (validated) session state.
 */
export async function middleware(original: NextRequest) {
  const routing = prepareLocaleRequest(original);
  if (routing.redirect) return routing.redirect;
  return finishLocaleResponse(await refreshSession(routing.request), routing);
}

async function refreshSession(request: NextRequest) {
  const publicSkillResponse = await routePublicSkill(request);
  if (publicSkillResponse) return publicSkillResponse;
  const isReview =
    request.nextUrl.pathname === '/blog/review' ||
    request.nextUrl.pathname.startsWith('/blog/review/') ||
    request.nextUrl.pathname === '/skills/private' ||
    request.nextUrl.pathname.startsWith('/skills/private/');
  const protectReviewResponse = (response: NextResponse) => {
    if (isReview) {
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      response.headers.set('Referrer-Policy', 'no-referrer');
    }
    return response;
  };
  const env = getSupabasePublicEnv();
  if (!env) {
    return protectReviewResponse(
      isReview ? new NextResponse(null, { status: 404 }) : NextResponse.next(),
    );
  }

  let response = NextResponse.next({ request });
  const currentInfo = request.cookies.get(USER_INFO_COOKIE)?.value;
  const hasSession = request.cookies
    .getAll()
    .some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));
  if (!hasSession) {
    if (isReview)
      return protectReviewResponse(new NextResponse(null, { status: 404 }));
    if (currentInfo)
      response.cookies.set(USER_INFO_COOKIE, '', {
        ...AUTH_COOKIE_OPTIONS,
        httpOnly: false,
        maxAge: 0,
      });
    return protectReviewResponse(response);
  }
  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, {
            ...options,
            ...AUTH_COOKIE_OPTIONS,
          });
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const user = error ? null : publicUserInfoFromClaims(data?.claims);
  if (isReview) {
    let allowed = false;
    try {
      const session = user
        ? (await supabase.auth.getSession()).data.session
        : null;
      if (session)
        allowed = await serverTrpc.adminAuth.checkAccess.mutate({
          token: session.access_token,
        });
    } catch {
      // Drafts must remain private if the identity or role service is unavailable.
    }
    if (!allowed)
      return protectReviewResponse(new NextResponse(null, { status: 404 }));
  }
  if (user) {
    const info = serializeUserInfo(user);
    if (currentInfo !== info) {
      response.cookies.set(USER_INFO_COOKIE, info, {
        ...AUTH_COOKIE_OPTIONS,
        httpOnly: false,
      });
    }
  } else if (currentInfo) {
    response.cookies.set(USER_INFO_COOKIE, '', {
      ...AUTH_COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: 0,
    });
  }

  return protectReviewResponse(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
