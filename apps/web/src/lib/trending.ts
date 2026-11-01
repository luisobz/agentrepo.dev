import { cache } from 'react';
import { serverTrpc } from './trpc-server';
export const getTrendingContent = cache(async () => {
  try {
    return await serverTrpc.popularity.trending.query();
  } catch {
    return [];
  } // Optional discovery must not make public content unavailable.
});
