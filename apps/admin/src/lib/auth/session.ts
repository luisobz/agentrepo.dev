import { verifySessionToken } from '@agentrepo/trpc/auth';
import { cookies } from 'next/headers';
import { ADMIN_ACCESS_COOKIE } from './constants';
import { getAuthSecret } from './secret';

export async function hasValidAdminSession(): Promise<boolean> {
  const secret = getAuthSecret();
  if (!secret) {
    return false;
  }
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value, secret);
}
