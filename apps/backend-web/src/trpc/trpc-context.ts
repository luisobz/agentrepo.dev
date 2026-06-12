import { createCatalogUseCases, SearchCatalog } from '@agentrepo/application';
import { BackendEnvironments } from '@agentrepo/config';
import {
  PrismaAgentRepository,
  PrismaBlogPostRepository,
  PrismaGlobalSearchRepository,
  PrismaService,
  PrismaSkillRepository,
} from '@agentrepo/infrastructure';
import { TRPCContext, verifySessionToken } from '@agentrepo/trpc';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const BEARER_PREFIX = 'Bearer ';

function extractBearerToken(authorization: string | undefined): string | undefined {
  if (!authorization?.startsWith(BEARER_PREFIX)) {
    return undefined;
  }
  return authorization.slice(BEARER_PREFIX.length);
}

/**
 * Composition root for the tRPC layer: wires Prisma repositories into the
 * application use cases and resolves the admin session per request.
 */
export function buildCreateContext(prisma: PrismaService) {
  const catalog = createCatalogUseCases({
    skillRepository: new PrismaSkillRepository(prisma),
    agentRepository: new PrismaAgentRepository(prisma),
    blogPostRepository: new PrismaBlogPostRepository(prisma),
  });
  const globalSearch = new SearchCatalog(new PrismaGlobalSearchRepository(prisma));

  return async function createContext({
    req,
  }: CreateExpressContextOptions): Promise<TRPCContext> {
    const token = extractBearerToken(req.headers.authorization);
    const isAdmin = await verifySessionToken(
      token,
      BackendEnvironments.NEXTAUTH_SECRET
    );

    return { isAdmin, catalog, globalSearch };
  };
}
