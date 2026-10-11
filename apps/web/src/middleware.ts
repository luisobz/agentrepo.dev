import { createServerClient } from '@supabase/ssr';
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

/**
 * Keeps the Supabase session alive server-side: getClaims() verifies signatures and refreshes expired
 * access tokens with the HttpOnly refresh cookie, and the JS-readable
 * user-info cookie is kept in sync with the (validated) session state.
 */
export async function middleware(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const currentInfo = request.cookies.get(USER_INFO_COOKIE)?.value;
  const hasSession = request.cookies
    .getAll()
    .some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));
  if (!hasSession) {
    if (currentInfo)
      response.cookies.set(USER_INFO_COOKIE, '', {
        ...AUTH_COOKIE_OPTIONS,
        httpOnly: false,
        maxAge: 0,
      });
    return response;
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

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
