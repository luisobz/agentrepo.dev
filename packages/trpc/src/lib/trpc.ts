import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { CatalogUseCases, GlobalSearchParams } from '@agentrepo/application';
import type { UseCase } from '@agentrepo/application';
import {
  DomainError,
  EntityNotFoundError,
  SlugAlreadyInUseError,
} from '@agentrepo/domain';
import type { SearchHit } from '@agentrepo/domain';

export interface TRPCContext {
  isAdmin: boolean;
  catalog: CatalogUseCases;
  globalSearch: UseCase<GlobalSearchParams, SearchHit[]>;
}

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

function toTRPCError(error: DomainError): TRPCError {
  if (error instanceof EntityNotFoundError) {
    return new TRPCError({ code: 'NOT_FOUND', message: error.message, cause: error });
  }
  if (error instanceof SlugAlreadyInUseError) {
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

export const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin session required' });
  }
  return next();
});
