import { verifySessionToken } from '@agentrepo/trpc/auth';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE } from './constants';

// Must match the backend default in @agentrepo/config so both sides verify
// the same signature when NEXTAUTH_SECRET is not set locally.
const DEV_FALLBACK_SECRET = 'dev-nextauth-secret-change-me';

export function getAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET || DEV_FALLBACK_SECRET;
}

export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token, getAuthSecret());
}
