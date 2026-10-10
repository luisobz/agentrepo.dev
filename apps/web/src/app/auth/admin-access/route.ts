import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabase/server';
import { serverTrpc } from '../../../lib/trpc-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let isAdmin = false;
  try {
    const client = await getSupabaseServerClient();
    const session = client
      ? (await client.auth.getSession()).data.session
      : null;
    if (session) {
      isAdmin = await serverTrpc.adminAuth.checkAccess.mutate({
        token: session.access_token,
      });
    }
  } catch {
    // A failed identity/role check must never display the privileged shortcut.
  }
  return NextResponse.json(
    { isAdmin },
    {
      headers: { 'Cache-Control': 'private, no-store' },
    },
  );
}
