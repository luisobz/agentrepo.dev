import { verifySessionToken } from '@agentrepo/trpc/auth';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE } from './constants';


export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  // TODO pending to secure access to auth secret
  return verifySessionToken(token, '');
}
