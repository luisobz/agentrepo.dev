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
  PrismaAdminUserRepository,
  PrismaAgentRepository,
  PrismaAgentVersionRepository,
  PrismaBlogPostRepository,
  PrismaContactRequestRepository,
  PrismaGlobalSearchRepository,
  PrismaPlaygroundDeploymentRepository,
  PrismaPlaygroundTokenRepository,
  PrismaService,
  PrismaSkillRepository,
  PrismaSkillVersionRepository,
  StaticCodeValidator,
  SupabasePasswordAuthenticator,
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

interface SupabaseCreatorUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; name?: string };
}

function isCreatorUser(value: unknown): value is SupabaseCreatorUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return typeof user['id'] === 'string' && typeof user['email'] === 'string';
}

async function resolveCreatorUserId(token: string, prisma: PrismaService): Promise<string | null> {
  const response = await fetch(`${BackendEnvironments.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: BackendEnvironments.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const identity: unknown = await response.json().catch(() => null);
  if (!isCreatorUser(identity)) return null;
  const metadataName = identity.user_metadata?.full_name ?? identity.user_metadata?.name;
  const name = (typeof metadataName === 'string' ? metadataName : identity.email.split('@')[0]).trim().slice(0, 120);
  const user = await prisma.user.upsert({
    where: { email: identity.email },
    update: { supabaseId: identity.id },
    create: { email: identity.email, supabaseId: identity.id, name, provider: 'email' },
  });
  return user.id;
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
    skillVersionRepository: new PrismaSkillVersionRepository(prisma),
    agentVersionRepository: new PrismaAgentVersionRepository(prisma),
  });
  const globalSearch = new SearchCatalog(new PrismaGlobalSearchRepository(prisma));
  const portfolioLogger = new Logger('ContactWorkflow');
  const portfolio = createPortfolioUseCases({
    contactRequestRepository: new PrismaContactRequestRepository(prisma),
    contactWorkflowDispatcher: new InternalWorkflowClient({
      baseUrl: BackendEnvironments.BACKEND_AI_SERVICE_URL,
      internalKey: BackendEnvironments.INTERNAL_COMMUNICATION_API_SECRET,
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
    passwordAuthenticator: new SupabasePasswordAuthenticator({
      url: BackendEnvironments.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: BackendEnvironments.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    }),
    adminUsers: new PrismaAdminUserRepository(prisma),
    config: {
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
    const creatorUserId = token && !isAdmin
      ? await resolveCreatorUserId(token, prisma)
      : null;

    return {
      isAdmin,
      creatorUserId,
      clientIp: req.ip ?? null,
      adminAuth,
      catalog,
      globalSearch,
      portfolio,
      playground,
    };
  };
}
