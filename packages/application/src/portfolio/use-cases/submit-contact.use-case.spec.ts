import { describe, expect, it, vi } from 'vitest';
import type { ContactRequest } from '@agentrepo/domain';
import type { AppLoggerPort } from '../ports/app-logger.port';
import type { ContactRequestRepository } from '../ports/contact-request.repository';
import type { ContactWorkflowDispatcher } from '../ports/contact-workflow-dispatcher';
import { SubmitContact } from './submit-contact.use-case';

const NOW = new Date('2026-07-06T10:00:00Z');

function buildContactRequest(): ContactRequest {
  return {
    id: 'req-1',
    email: 'jane@company.com',
    subject: 'employment',
    message: 'We are hiring an AI engineer for our platform team.',
    status: 'PENDING',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function buildDeps() {
  const contactRequests: ContactRequestRepository = {
    create: vi.fn().mockResolvedValue(buildContactRequest()),
    list: vi.fn(),
    updateStatus: vi.fn().mockResolvedValue(undefined),
  };
  const dispatcher: ContactWorkflowDispatcher = {
    dispatch: vi.fn().mockResolvedValue(undefined),
  };
  const logger: AppLoggerPort = { warn: vi.fn(), error: vi.fn() };
  return { contactRequests, dispatcher, logger };
}

async function flushMicrotasks() {
  await new Promise((resolve) => setImmediate(resolve));
}

describe('SubmitContact', () => {
  it('persists the request and returns its id immediately', async () => {
    const { contactRequests, dispatcher, logger } = buildDeps();
    const useCase = new SubmitContact(contactRequests, dispatcher, logger);

    const result = await useCase.execute({
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our platform team.',
    });

    expect(result).toEqual({ success: true, id: 'req-1' });
    expect(contactRequests.create).toHaveBeenCalledWith({
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our platform team.',
    });
  });

  it('dispatches the workflow without blocking the response', async () => {
    const { contactRequests, dispatcher, logger } = buildDeps();
    let resolveDispatch: () => void = () => undefined;
    vi.mocked(dispatcher.dispatch).mockImplementation(
      () => new Promise((resolve) => (resolveDispatch = resolve))
    );
    const useCase = new SubmitContact(contactRequests, dispatcher, logger);

    // The dispatch promise is still pending when execute resolves.
    const result = await useCase.execute({
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our platform team.',
    });

    expect(result.success).toBe(true);
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      contactRequestId: 'req-1',
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our platform team.',
    });
    resolveDispatch();
  });

  it('logs and marks the request FAILED when the dispatch rejects', async () => {
    const { contactRequests, dispatcher, logger } = buildDeps();
    vi.mocked(dispatcher.dispatch).mockRejectedValue(
      new Error('backend-ai unreachable')
    );
    const useCase = new SubmitContact(contactRequests, dispatcher, logger);

    const result = await useCase.execute({
      email: 'jane@company.com',
      subject: 'employment',
      message: 'We are hiring an AI engineer for our platform team.',
    });
    await flushMicrotasks();

    expect(result.success).toBe(true);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('backend-ai unreachable'),
      expect.any(String)
    );
    expect(contactRequests.updateStatus).toHaveBeenCalledWith('req-1', 'FAILED');
  });
});
