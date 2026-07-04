/**
 * Options forced onto every Supabase auth cookie so session and refresh
 * tokens are never readable from client-side JavaScript. The user-info
 * cookie is the one intentional exception: it only carries non-sensitive
 * display data for the frontend.
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const USER_INFO_COOKIE = 'agentrepo_user_info';
