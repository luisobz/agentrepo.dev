const PUBLIC_READS = new Set([
  'skills.list',
  'skills.bySlug',
  'skills.versions',
  'skills.byVersion',
  'agents.list',
  'agents.bySlug',
  'agents.versions',
  'agents.byVersion',
  'blog.getPosts',
  'blog.getPostBySlug',
]);

/** Cache only anonymous published content, preserving superjson's wire format. */
export function publicCatalogFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const request = input instanceof Request ? input : null;
  const url = new URL(request?.url ?? String(input));
  const headers = new Headers(init?.headers ?? request?.headers);
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  const procedures = url.pathname.split('/').at(-1)?.split(',') ?? [];
  const publicRead =
    method === 'GET' &&
    !headers.has('authorization') &&
    !headers.has('cookie') &&
    init?.credentials !== 'include' &&
    procedures.length > 0 &&
    procedures.every((name) => PUBLIC_READS.has(name));
  const options: RequestInit = {
    ...init,
    cache: publicRead ? 'force-cache' : 'no-store',
    ...(publicRead
      ? { next: { revalidate: 30, tags: ['public-catalog'] } }
      : {}),
  };
  return fetch(input, options);
}
