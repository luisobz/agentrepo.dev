import { cache } from 'react';
import type { RouterOutputs } from '@agentrepo/trpc/schemas';
import { fetchAllPages, isClientNotFound } from './public-content';
import { serverTrpc } from './trpc-server';

export type BlogPost = RouterOutputs['blog']['getPostBySlug'];

export function getPublishedPosts(): Promise<BlogPost[]> {
  return fetchAllPages((input) => serverTrpc.blog.getPosts.query(input));
}

/** Deduplicated per request so the page and its metadata share one fetch. */
export const getPublishedPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    try {
      return await serverTrpc.blog.getPostBySlug.query({ slug });
    } catch (error) {
      if (isClientNotFound(error)) {
        return null;
      }
      throw error;
    }
  }
);
