import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type {
  AdminAuthUseCases,
  CatalogUseCases,
  GlobalSearchParams,
  PlaygroundUseCases,
  PortfolioUseCases,
} from '@agentrepo/application';
import type { UseCase } from '@agentrepo/application';
import {
  DomainError,
  EntityNotFoundError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  SlugAlreadyInUseError,
  VersionAlreadyExistsError,
} from '@agentrepo/domain';
import type { SearchHit } from '@agentrepo/domain';
import { FixedWindowRateLimiter } from './auth/login-rate-limit';

export interface TRPCContext {
  isAdmin: boolean;
  creatorUserId?: string | null;
  /** Best-effort client IP, used as the key for abuse rate limiting. */
  clientIp: string | null;
  adminAuth: AdminAuthUseCases;
  catalog: CatalogUseCases;
  globalSearch: UseCase<GlobalSearchParams, SearchHit[]>;
  portfolio: PortfolioUseCases;
  playground: PlaygroundUseCases;
}

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

function toTRPCError(error: DomainError): TRPCError {
  if (error instanceof EntityNotFoundError) {
    return new TRPCError({ code: 'NOT_FOUND', message: error.message, cause: error });
  }
  if (
    error instanceof InvalidCredentialsError ||
    error instanceof InvalidRefreshTokenError
  ) {
    return new TRPCError({ code: 'UNAUTHORIZED', message: error.message, cause: error });
  }
  if (
    error instanceof SlugAlreadyInUseError ||
    error instanceof VersionAlreadyExistsError
  ) {
    return new TRPCError({ code: 'CONFLICT', message: error.message, cause: error });
  }
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message,
    cause: error,
  });
}

const mapDomainErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok && result.error.cause instanceof DomainError) {
    throw toTRPCError(result.error.cause);
  }
  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(mapDomainErrors);

/**
 * Builds a middleware that rate-limits a procedure by client IP. Enforced at
 * the trusted boundary (the backend itself), so it cannot be bypassed by
 * calling the tRPC endpoint directly instead of going through the BFF.
 */
export function rateLimit(limiter: FixedWindowRateLimiter, bucket: string) {
  return t.middleware(({ ctx, next }) => {
    const key = `${bucket}:${ctx.clientIp ?? 'unknown'}`;
    if (!limiter.consume(key)) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later',
      });
    }
    return next();
  });
}

export const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin session required' });
  }
  return next();
});

export const creatorProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.creatorUserId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Creator sign-in required' });
  }
  return next({ ctx: { creatorUserId: ctx.creatorUserId } });
});
