import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_OPTIONS, USER_INFO_COOKIE } from './lib/auth/cookie-options';
import { serializeUserInfo, toPublicUserInfo } from './lib/auth/user-info';
import { getSupabasePublicEnv } from './lib/supabase/config';

/**
 * Keeps the Supabase session alive server-side: getUser() refreshes expired
 * access tokens with the HttpOnly refresh cookie, and the JS-readable
 * user-info cookie is kept in sync with the (validated) session state.
 */
export async function middleware(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, { ...options, ...AUTH_COOKIE_OPTIONS });
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentInfo = request.cookies.get(USER_INFO_COOKIE)?.value;
  if (user) {
    const info = serializeUserInfo(toPublicUserInfo(user));
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
