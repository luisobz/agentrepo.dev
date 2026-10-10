import type { AppRouter } from '@agentrepo/trpc/schemas';
import { submitAgentSchema, submitSkillSchema } from '@agentrepo/trpc/schemas';
import { createTRPCClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import { NextRequest, NextResponse } from 'next/server';
import superjson from 'superjson';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

  const raw = await request.text();
  if (raw.length > 200_000) return NextResponse.json({ error: 'Submission too large' }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const client = createTRPCClient<AppRouter>({ links: [httpBatchLink({
    url: `${API_BASE}/api/trpc`, transformer: superjson,
    headers: { authorization: `Bearer ${session.access_token}` },
  })] });

  try {
    if (typeof body === 'object' && body !== null && 'kind' in body && body.kind === 'skill') {
      const parsed = submitSkillSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid skill' }, { status: 400 });
      const asset = await client.creator.submitSkill.mutate(parsed.data);
      return NextResponse.json({ id: asset.id, slug: asset.slug, kind: 'skill', status: 'pending_review' }, { status: 201 });
    }
    if (typeof body === 'object' && body !== null && 'kind' in body && body.kind === 'agent') {
      const parsed = submitAgentSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
      const asset = await client.creator.submitAgent.mutate(parsed.data);
      return NextResponse.json({ id: asset.id, slug: asset.slug, kind: 'agent', status: 'pending_review' }, { status: 201 });
    }
    return NextResponse.json({ error: 'Unknown asset kind' }, { status: 400 });
  } catch (error) {
    if (error instanceof TRPCClientError && error.data?.code === 'CONFLICT') {
      return NextResponse.json({ error: 'That slug is already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Could not save the submission' }, { status: 502 });
  }
}
