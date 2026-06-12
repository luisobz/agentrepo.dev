import { cache } from 'react';
import type { RouterOutputs } from '@agentrepo/trpc/schemas';
import { fetchAllPages, isClientNotFound } from './public-content';
import { serverTrpc } from './trpc-server';

export type Skill = RouterOutputs['skills']['bySlug'];

export function getPublishedSkills(): Promise<Skill[]> {
  return fetchAllPages((input) => serverTrpc.skills.list.query(input));
}

/** Deduplicated per request so the page and its metadata share one fetch. */
export const getPublishedSkillBySlug = cache(
  async (slug: string): Promise<Skill | null> => {
    try {
      return await serverTrpc.skills.bySlug.query({ slug });
    } catch (error) {
      if (isClientNotFound(error)) {
        return null;
      }
      throw error;
    }
  }
);
