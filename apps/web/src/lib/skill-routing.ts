import { NextRequest, NextResponse } from 'next/server';
import { semverSchema, slugSchema } from '@agentrepo/trpc/schemas';
import { serverTrpc } from './trpc-server';
import { isClientNotFound } from './public-content';

const missingDocument = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Skill not found | AgentRepo.dev</title><link rel="icon" href="/icon.svg">
<style>body{margin:0;background:#f6f1e8;color:#161616;font:1rem/1.6 system-ui,sans-serif}main{max-width:40rem;margin:12vh auto;padding:2rem}header a{display:inline-flex;align-items:center;gap:.6rem;text-decoration:none;color:#7a2230;font-weight:700}img{width:2rem;height:2rem}section{margin-top:3rem;padding:2rem;border:1px solid #d8d0c5;border-radius:12px;background:#fffcf7}h1{line-height:1.2}section a{color:#7a2230}small{font-family:monospace}</style></head>
<body><main><header><a href="/"><img src="/icon.svg" alt="">agentrepo.dev</a></header><section><small>404</small><h1>Skill not found</h1><p>The requested skill or version is not available. Choose a published release from the catalogue.</p><a href="/skills">← Back to skills</a></section></main></body></html>`;

function missingRelease() {
  // A direct response avoids Next's loading boundary turning a not-found into HTTP 200.
  return new NextResponse(missingDocument, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function routePublicSkill(
  request: NextRequest,
): Promise<NextResponse | null> {
  const match = /^\/skills\/([^/]+)(?:\/([^/]+))?\/?$/.exec(
    request.nextUrl.pathname,
  );
  if (!match) return null;
  let slug: string;
  let pathVersion: string | undefined;
  try {
    slug = decodeURIComponent(match[1]);
    pathVersion = match[2] ? decodeURIComponent(match[2]) : undefined;
  } catch {
    return missingRelease();
  }
  if (slug === 'private') return null;
  if (!slugSchema.safeParse(slug).success) return missingRelease();
  const floating = !pathVersion || pathVersion === 'latest';
  const selected =
    pathVersion === 'latest'
      ? null
      : (pathVersion ?? request.nextUrl.searchParams.get('version'));
  if (selected !== null && !semverSchema.safeParse(selected).success)
    return missingRelease();
  try {
    if (!floating && selected) {
      const locale =
        request.cookies.get('locale')?.value === 'es' ? 'es' : 'en';
      const pinned = await serverTrpc.skills.byVersion.query({
        slug,
        version: selected,
        locale,
      });
      return pinned?.version === selected ? null : missingRelease();
    }
    const versions = await serverTrpc.skills.versions.query({ slug });
    const version =
      selected ?? versions.find((entry) => entry.isLatest)?.version;
    if (!version || !versions.some((entry) => entry.version === version))
      return missingRelease();
    const target = new URL(
      `/skills/${encodeURIComponent(slug)}/${encodeURIComponent(version)}`,
      request.url,
    );
    const response = NextResponse.redirect(target, 307);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    if (isClientNotFound(error)) return missingRelease();
    return new NextResponse('Skill service temporarily unavailable', {
      status: 503,
      headers: {
        'Retry-After': '5',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });
  }
}
