import { getServerLocale } from './i18n/server';
import { cache } from 'react';
import type { RouterOutputs } from '@agentrepo/trpc/schemas';
import { fetchAllPages, isClientNotFound } from './public-content';
import { serverTrpc } from './trpc-server';

export type BlogPost = RouterOutputs['blog']['getPostBySlug'];

export async function getPublishedPosts(): Promise<
  RouterOutputs['blog']['catalog']['items']
> {
  const locale = await getServerLocale();
  return fetchAllPages((input) =>
    serverTrpc.blog.catalog.query({ ...input, locale }),
  );
}

/** Deduplicated per request so the page and its metadata share one fetch. */
export const getPublishedPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    try {
      return await serverTrpc.blog.getPostBySlug.query({
        slug,
        locale: await getServerLocale(),
      });
    } catch (error) {
      if (isClientNotFound(error)) {
        return null;
      }
      throw error;
    }
  },
);
