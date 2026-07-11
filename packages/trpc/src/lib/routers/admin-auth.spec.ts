import type { AdminSessionTokens, CatalogUseCases } from '@agentrepo/application';
import { InvalidCredentialsError, InvalidRefreshTokenError } from '@agentrepo/domain';
import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { TRPCContext } from '../trpc';
import { appRouter } from './_app';

const tokens: AdminSessionTokens = {
  accessToken: 'access',
  accessExpiresAt: new Date(Date.now() + 60_000),
  refreshToken: 'refresh',
  refreshExpiresAt: new Date(Date.now() + 3_600_000),
};

function buildContext(adminAuth: Partial<TRPCContext['adminAuth']>): TRPCContext {
  return {
    isAdmin: false,
    clientIp: crypto.randomUUID(),
    adminAuth: adminAuth as TRPCContext['adminAuth'],
    catalog: {} as CatalogUseCases,
    globalSearch: { execute: async () => [] },
    portfolio: {} as TRPCContext['portfolio'],
    playground: {} as TRPCContext['playground'],
  };
}

async function expectTRPCCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toSatisfy(
    (error) => error instanceof TRPCError && error.code === code
  );
}

describe('adminAuth router', () => {
  it('returns the issued tokens on login', async () => {
    const caller = appRouter.createCaller(
      buildContext({ login: { execute: async () => tokens } })
    );

    await expect(
      caller.adminAuth.login({ email: 'admin@agentrepo.dev', password: 'secret' })
    ).resolves.toEqual(tokens);
  });

  it('maps InvalidCredentialsError to UNAUTHORIZED', async () => {
    const caller = appRouter.createCaller(
      buildContext({
        login: {
          execute: async () => {
            throw new InvalidCredentialsError();
          },
        },
      })
    );

    await expectTRPCCode(
      caller.adminAuth.login({ email: 'admin@agentrepo.dev', password: 'wrong' }),
      'UNAUTHORIZED'
    );
  });

  it('maps InvalidRefreshTokenError to UNAUTHORIZED', async () => {
    const caller = appRouter.createCaller(
      buildContext({
        refresh: {
          execute: async () => {
            throw new InvalidRefreshTokenError();
          },
        },
      })
    );

    await expectTRPCCode(
      caller.adminAuth.refresh({ refreshToken: 'reused' }),
      'UNAUTHORIZED'
    );
  });
});
