import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import type { AgentFlowEvent } from '@agentrepo/application';
import { TRPCContext } from '../trpc';
import { appRouter } from './_app';

const FLOW_EVENTS: AgentFlowEvent[] = [
  { type: 'coder', phase: 'start', detail: 'coding' },
  { type: 'review', code: 'export default function X() { return <div/>; }', summary: 'done' },
];

function buildContext(options?: {
  isAdmin?: boolean;
  consumeValid?: boolean;
}): TRPCContext {
  return {
    isAdmin: options?.isAdmin ?? false,
    adminAuth: {} as TRPCContext['adminAuth'],
    catalog: {} as TRPCContext['catalog'],
    globalSearch: { execute: async () => [] },
    portfolio: {} as TRPCContext['portfolio'],
    playground: {
      createToken: { execute: vi.fn() },
      listTokens: {
        execute: vi
          .fn()
          .mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 }),
      },
      setTokenActive: { execute: vi.fn() },
      deleteToken: { execute: vi.fn() },
      checkToken: {
        execute: vi
          .fn()
          .mockResolvedValue({ valid: true, remainingUses: 4 }),
      },
      consumeToken: {
        execute: vi.fn().mockResolvedValue({
          valid: options?.consumeValid ?? true,
          remainingUses: 4,
        }),
      },
      saveDeployment: { execute: vi.fn() },
      executeAgentFlow: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async function* (_input: { prompt: string }) {
          yield* FLOW_EVENTS;
        },
      },
    } as unknown as TRPCContext['playground'],
  };
}

describe('playground router', () => {
  it('streams the agent flow after consuming a valid token', async () => {
    const ctx = buildContext();
    const caller = appRouter.createCaller(ctx);

    const events: AgentFlowEvent[] = [];
    const stream = await caller.playground.executeFlow({
      token: 'token-12345',
      prompt: 'Build a pricing table with three plans',
    });
    for await (const event of stream) {
      events.push(event);
    }

    expect(events).toEqual(FLOW_EVENTS);
    expect(ctx.playground.consumeToken.execute).toHaveBeenCalledWith(
      'token-12345'
    );
  });

  it('rejects the flow when the token cannot be consumed', async () => {
    const caller = appRouter.createCaller(buildContext({ consumeValid: false }));

    const stream = await caller.playground.executeFlow({
      token: 'token-12345',
      prompt: 'Build a pricing table with three plans',
    });

    await expect(
      (async () => {
        for await (const event of stream) {
          void event;
        }
      })()
    ).rejects.toSatisfy(
      (error) => error instanceof TRPCError && error.code === 'FORBIDDEN'
    );
  });

  it('requires admin for token management', async () => {
    const caller = appRouter.createCaller(buildContext({ isAdmin: false }));

    await expect(
      caller.playground.admin.list({ page: 1, pageSize: 20 })
    ).rejects.toSatisfy(
      (error) => error instanceof TRPCError && error.code === 'UNAUTHORIZED'
    );
  });

  it('validates tokens without consuming them', async () => {
    const ctx = buildContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.playground.validateToken({
      token: 'token-12345',
    });

    expect(result).toEqual({ valid: true, remainingUses: 4 });
    expect(ctx.playground.consumeToken.execute).not.toHaveBeenCalled();
  });
});
