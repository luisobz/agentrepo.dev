import { Logger } from '@nestjs/common';
import {
  createAdminAuthUseCases,
  createCatalogUseCases,
  createPlaygroundUseCases,
  createPortfolioUseCases,
  SearchCatalog,
} from '@agentrepo/application';
import { BackendEnvironments } from '@agentrepo/config';
import {
  DeepSeekCoderService,
  InternalWorkflowClient,
  PrismaAdminSessionRepository,
  PrismaAgentRepository,
  PrismaBlogPostRepository,
  PrismaContactRequestRepository,
  PrismaGlobalSearchRepository,
  PrismaPlaygroundDeploymentRepository,
  PrismaPlaygroundTokenRepository,
  PrismaService,
  PrismaSkillRepository,
  StaticCodeValidator,
} from '@agentrepo/infrastructure';
import { createSessionToken, TRPCContext, verifySessionToken } from '@agentrepo/trpc';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const BEARER_PREFIX = 'Bearer ';

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 30 * 1000;

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
  const portfolioLogger = new Logger('ContactWorkflow');
  const portfolio = createPortfolioUseCases({
    contactRequestRepository: new PrismaContactRequestRepository(prisma),
    contactWorkflowDispatcher: new InternalWorkflowClient({
      baseUrl: BackendEnvironments.BACKEND_AI_URL,
      internalKey: BackendEnvironments.INTERNAL_API_SECRET,
    }),
    logger: {
      warn: (message) => portfolioLogger.warn(message),
      error: (message, stack) => portfolioLogger.error(message, stack),
    },
  });
  const playground = createPlaygroundUseCases({
    tokenRepository: new PrismaPlaygroundTokenRepository(prisma),
    deploymentRepository: new PrismaPlaygroundDeploymentRepository(prisma),
    codeGenerator: new DeepSeekCoderService({
      apiKey: BackendEnvironments.DEEPSEEK_API_KEY,
      model: BackendEnvironments.DEEPSEEK_MODEL,
      baseUrl: BackendEnvironments.DEEPSEEK_BASE_URL,
    }),
    codeValidator: new StaticCodeValidator(),
  });
  const adminAuth = createAdminAuthUseCases({
    sessions: new PrismaAdminSessionRepository(prisma),
    accessTokens: {
      issue: (ttlMs) =>
        createSessionToken(BackendEnvironments.AUTH_SECRET, ttlMs, 'access'),
    },
    config: {
      adminPassword: BackendEnvironments.ADMIN_PASSWORD,
      accessTtlMs: ACCESS_TTL_MS,
      refreshTtlMs: REFRESH_TTL_MS,
      rotationGraceMs: ROTATION_GRACE_MS,
    },
  });

  return async function createContext({
    req,
  }: CreateExpressContextOptions): Promise<TRPCContext> {
    const token = extractBearerToken(req.headers.authorization);
    const isAdmin = await verifySessionToken(
      token,
      BackendEnvironments.AUTH_SECRET
    );

    return { isAdmin, adminAuth, catalog, globalSearch, portfolio, playground };
  };
}
