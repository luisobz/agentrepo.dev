import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ContactWorkflowController } from './contact-workflow.controller';
import type { ContactWorkflowUseCase } from './workflow.tokens';

const VALID_PAYLOAD = {
  contactRequestId: 'b3b6a8a2-8f4f-4a63-9a2e-3f8f0f9d2c11',
  email: 'jane@company.com',
  subject: 'freelance',
  message: 'We need help with a RAG pipeline.',
};

function buildController(useCase?: Partial<ContactWorkflowUseCase>) {
  const execute = vi.fn().mockResolvedValue(undefined);
  const controller = new ContactWorkflowController({
    execute,
    ...useCase,
  } as ContactWorkflowUseCase);
  return { controller, execute };
}

async function flushMicrotasks() {
  await new Promise((resolve) => setImmediate(resolve));
}

describe('ContactWorkflowController', () => {
  it('accepts a valid payload and kicks the workflow in the background', async () => {
    const { controller, execute } = buildController();

    const response = controller.accept(VALID_PAYLOAD);

    expect(response).toEqual({ accepted: true });
    await flushMicrotasks();
    expect(execute).toHaveBeenCalledWith(VALID_PAYLOAD);
  });

  it('rejects malformed payloads with 400', () => {
    const { controller, execute } = buildController();

    expect(() =>
      controller.accept({ ...VALID_PAYLOAD, email: 'nope' })
    ).toThrow(BadRequestException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('does not propagate background workflow failures to the response', async () => {
    const { controller, execute } = buildController();
    execute.mockRejectedValue(new Error('llm down'));

    expect(controller.accept(VALID_PAYLOAD)).toEqual({ accepted: true });
    await flushMicrotasks();
  });
});
