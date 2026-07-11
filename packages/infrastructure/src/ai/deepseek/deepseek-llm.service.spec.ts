import { describe, expect, it, vi } from 'vitest';
import type { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage } from '@langchain/core/messages';
import { DeepSeekLLMService } from './deepseek-llm.service';

const CONFIG = { apiKey: 'test-key', model: 'deepseek-chat' };

function buildChatModel(reply = 'Personalised analysis') {
  const invoke = vi.fn().mockResolvedValue(new AIMessage(reply));
  return { model: { invoke } as unknown as BaseChatModel, invoke };
}

describe('DeepSeekLLMService', () => {
  it('sends the system prompt plus the contact payload to the chat model', async () => {
    const { model, invoke } = buildChatModel();
    const service = new DeepSeekLLMService(CONFIG, undefined, model);

    const result = await service.generateContactAnalysis({
      senderEmail: 'jane@company.com',
      subject: 'freelance',
      message: 'We need a RAG pipeline.',
    });

    expect(result).toBe('Personalised analysis');
    const [messages] = invoke.mock.calls[0];
    expect(messages).toHaveLength(2);
    expect(messages[0].content).toContain('virtual assistant of Luis');
    expect(messages[1].content).toContain('jane@company.com');
    expect(messages[1].content).toContain('We need a RAG pipeline.');
  });

  it('attaches the Langfuse callback handler when configured', async () => {
    const { model, invoke } = buildChatModel();
    const handler = { name: 'langfuse' } as unknown as BaseCallbackHandler;
    const service = new DeepSeekLLMService(CONFIG, handler, model);

    await service.generateContactAnalysis({
      senderEmail: 'jane@company.com',
      subject: 'question',
      message: 'How do you version prompts?',
    });

    const [, options] = invoke.mock.calls[0];
    expect(options.callbacks).toEqual([handler]);
  });

  it('omits callbacks when no handler is configured', async () => {
    const { model, invoke } = buildChatModel();
    const service = new DeepSeekLLMService(CONFIG, undefined, model);

    await service.generateContactAnalysis({
      senderEmail: 'jane@company.com',
      subject: 'other',
      message: 'Hello there, great portfolio!',
    });

    const [, options] = invoke.mock.calls[0];
    expect(options.callbacks).toBeUndefined();
  });
});
