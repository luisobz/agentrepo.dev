import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { TRPCContext } from '../trpc';
import { appRouter } from './_app';

function buildContext(options?: { isAdmin?: boolean }): TRPCContext {
  return {
    isAdmin: options?.isAdmin ?? false,
    adminAuth: {} as TRPCContext['adminAuth'],
    catalog: {} as TRPCContext['catalog'],
    globalSearch: { execute: async () => [] },
    portfolio: {
      submitContact: {
        execute: vi.fn().mockResolvedValue({ success: true, id: 'contact-1' }),
      },
      listContactRequests: {
        execute: vi
          .fn()
          .mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 }),
      },
    },
  };
}

describe('contact router', () => {
  it('accepts a valid submission and returns the id', async () => {
    const ctx = buildContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our team.',
    });

    expect(result).toEqual({ success: true, id: 'contact-1' });
    expect(ctx.portfolio.submitContact.execute).toHaveBeenCalledWith({
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our team.',
    });
  });

  it('rejects invalid emails and short messages', async () => {
    const caller = appRouter.createCaller(buildContext());

    await expect(
      caller.contact.submit({
        email: 'not-an-email',
        subject: 'employment',
        message: 'Long enough message here.',
      })
    ).rejects.toBeInstanceOf(TRPCError);

    await expect(
      caller.contact.submit({
        email: 'jane@company.com',
        subject: 'employment',
        message: 'short',
      })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it('requires an admin session to list contact requests', async () => {
    const caller = appRouter.createCaller(buildContext({ isAdmin: false }));

    await expect(
      caller.contact.admin.list({ page: 1, pageSize: 20 })
    ).rejects.toSatisfy(
      (error) => error instanceof TRPCError && error.code === 'UNAUTHORIZED'
    );
  });

  it('lists contact requests for admins', async () => {
    const ctx = buildContext({ isAdmin: true });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.admin.list({
      page: 1,
      pageSize: 20,
      status: 'FAILED',
    });

    expect(result.items).toEqual([]);
    expect(ctx.portfolio.listContactRequests.execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      status: 'FAILED',
    });
  });
});
