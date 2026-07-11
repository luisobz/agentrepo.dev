import { cache } from 'react';
import type { RouterOutputs } from '@agentrepo/trpc/schemas';
import { fetchAllPages, isClientNotFound } from './public-content';
import { serverTrpc } from './trpc-server';

export type Skill = RouterOutputs['skills']['bySlug'];
export type SkillVersionDetail = RouterOutputs['skills']['byVersion'];
export type SkillVersionSummary = RouterOutputs['skills']['versions'][number];

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

export const getSkillVersions = cache(
  async (slug: string): Promise<SkillVersionSummary[]> => {
    try {
      return await serverTrpc.skills.versions.query({ slug });
    } catch (error) {
      if (isClientNotFound(error)) {
        return [];
      }
      throw error;
    }
  }
);

export const getSkillVersion = cache(
  async (slug: string, version: string): Promise<SkillVersionDetail | null> => {
    try {
      return await serverTrpc.skills.byVersion.query({ slug, version });
    } catch (error) {
      if (isClientNotFound(error)) {
        return null;
      }
      throw error;
    }
  }
);
