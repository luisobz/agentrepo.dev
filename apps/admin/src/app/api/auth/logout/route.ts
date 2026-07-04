import { NextRequest, NextResponse } from 'next/server';
import { backendTrpc } from '../../../../lib/auth/backend-client';
import { ADMIN_REFRESH_COOKIE } from '../../../../lib/auth/constants';
import { clearSessionCookies } from '../../../../lib/auth/cookies';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (refreshToken) {
    // Revokes the whole session family server-side; clearing cookies alone
    // would leave the refresh token usable if it had been copied.
    await backendTrpc.adminAuth.logout.mutate({ refreshToken }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
