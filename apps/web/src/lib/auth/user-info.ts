import type { User } from '@supabase/supabase-js';
import { USER_INFO_COOKIE } from './cookie-options';

/**
 * The only session data exposed to client-side JavaScript. Keep it free of
 * anything sensitive (no email, no tokens): it exists so the UI can render
 * "logged in as" state without touching the HttpOnly auth cookies.
 */
export interface PublicUserInfo {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
}

function metadataString(user: User, key: string): string | null {
  const value = user.user_metadata?.[key];
  return typeof value === 'string' ? value : null;
}

export function toPublicUserInfo(user: User): PublicUserInfo {
  return {
    userId: user.id,
    name: metadataString(user, 'full_name') ?? metadataString(user, 'name'),
    avatarUrl: metadataString(user, 'avatar_url'),
  };
}

export function serializeUserInfo(info: PublicUserInfo): string {
  return JSON.stringify(info);
}

function parseUserInfoValue(rawValue: string): unknown {
  try {
    return JSON.parse(decodeURIComponent(rawValue));
  } catch {
    return JSON.parse(rawValue);
  }
}

function isPublicUserInfo(value: unknown): value is PublicUserInfo {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>)['userId'] === 'string'
  );
}

/** Reads the info cookie in the browser; null when logged out or on the server. */
export function readUserInfoCookie(): PublicUserInfo | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${USER_INFO_COOKIE}=`));
  if (!entry) {
    return null;
  }
  try {
    const parsed = parseUserInfoValue(entry.slice(USER_INFO_COOKIE.length + 1));
    return isPublicUserInfo(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
