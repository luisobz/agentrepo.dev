import { getServerLocale } from './i18n/server';
import { cache } from 'react';
import type { RouterOutputs } from '@agentrepo/trpc/schemas';
import type { FileTree, FileTreeNode } from '@agentrepo/trpc/schemas';
import { fetchAllPages, isClientNotFound } from './public-content';
import { serverTrpc } from './trpc-server';

export type Agent = RouterOutputs['agents']['bySlug'];
export type AgentVersionDetail = RouterOutputs['agents']['byVersion'];
export type AgentVersionSummary = RouterOutputs['agents']['versions'][number];

export async function getPublishedAgents(): Promise<
  RouterOutputs['agents']['catalog']['items']
> {
  const locale = await getServerLocale();
  return fetchAllPages((input) =>
    serverTrpc.agents.catalog.query({ ...input, locale }),
  );
}

/** Deduplicated per request so the page and its metadata share one fetch. */
export const getPublishedAgentBySlug = cache(
  async (slug: string): Promise<Agent | null> => {
    try {
      return await serverTrpc.agents.bySlug.query({
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

export const getAgentVersions = cache(
  async (slug: string): Promise<AgentVersionSummary[]> => {
    try {
      return await serverTrpc.agents.versions.query({
        slug,
        locale: await getServerLocale(),
      });
    } catch (error) {
      if (isClientNotFound(error)) {
        return [];
      }
      throw error;
    }
  },
);

export const getAgentVersion = cache(
  async (slug: string, version: string): Promise<AgentVersionDetail | null> => {
    try {
      return await serverTrpc.agents.byVersion.query({
        slug,
        version,
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

const PLAYGROUND_NAMES = new Set(['demo', 'playground', 'examples']);

function nodeIndicatesPlayground(node: FileTreeNode): boolean {
  const baseName = node.name.replace(/\.[^.]+$/, '').toLowerCase();
  if (PLAYGROUND_NAMES.has(baseName)) {
    return true;
  }
  return (
    node.type === 'directory' && node.children.some(nodeIndicatesPlayground)
  );
}

/**
 * Convention: an agent ships an interactive demo when its file tree contains
 * a node named `demo`, `playground` or `examples` at any depth.
 */
export function hasPlayground(fileTree: FileTree): boolean {
  return fileTree.some(nodeIndicatesPlayground);
}

export function countFiles(fileTree: FileTree): number {
  return fileTree.reduce(
    (sum, node) => sum + (node.type === 'file' ? 1 : countFiles(node.children)),
    0,
  );
}
