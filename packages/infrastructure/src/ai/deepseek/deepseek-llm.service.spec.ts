import { createServer } from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage } from '@langchain/core/messages';
import { DeepSeekLLMService } from './deepseek-llm.service';

const CONFIG = { apiKey: 'test-key', model: 'deepseek-flash' };
const INPUT = {
  senderEmail: 'jane@company.com',
  subject: 'freelance' as const,
  message: 'We need a RAG pipeline.',
};
function chat(reply: string) {
  const invoke = vi.fn().mockResolvedValue(new AIMessage(reply));
  return { model: { invoke } as unknown as BaseChatModel, invoke };
}
describe('DeepSeekLLMService', () => {
  it('validates a bounded JSON reply and excludes sender identity from the prompt', async () => {
    const { model, invoke } = chat(
      JSON.stringify({ reply: 'Thanks for your message.' }),
    );
    expect(
      await new DeepSeekLLMService(
        CONFIG,
        undefined,
        model,
      ).generateContactAnalysis(INPUT),
    ).toBe('Thanks for your message.');
    const [messages] = invoke.mock.calls[0];
    expect(messages[0].content).toContain('JSON');
    expect(messages[1].content).not.toContain(INPUT.senderEmail);
    expect(messages[1].content).toContain(INPUT.message);
  });
  it.each([
    'not json',
    '{"reply":',
    '{}',
    '{"reply":""}',
    JSON.stringify({ reply: 'a'.repeat(1401) }),
    '{"reply":"ok","to":"attacker@example.test"}',
  ])(
    'rejects invalid or unexpected model output within the retry budget: %s',
    async (reply) => {
      const { model, invoke } = chat(reply);
      await expect(
        new DeepSeekLLMService(
          CONFIG,
          undefined,
          model,
        ).generateContactAnalysis(INPUT),
      ).rejects.toThrow();
      expect(invoke).toHaveBeenCalledTimes(4);
    },
  );
  it('recovers from malformed JSON without more than three retries', async () => {
    const { model, invoke } = chat('{"reply":"Recovered"}');
    invoke
      .mockResolvedValueOnce(new AIMessage('{'))
      .mockResolvedValueOnce(new AIMessage('{}'));
    expect(
      await new DeepSeekLLMService(
        CONFIG,
        undefined,
        model,
      ).generateContactAnalysis(INPUT),
    ).toBe('Recovered');
    expect(invoke).toHaveBeenCalledTimes(3);
  });
  it('bounds input length before sending it to the model', async () => {
    const { model, invoke } = chat('{"reply":"OK"}');
    await new DeepSeekLLMService(
      CONFIG,
      undefined,
      model,
    ).generateContactAnalysis({ ...INPUT, message: 'x'.repeat(10000) });
    expect(invoke.mock.calls[0][0][1].content.length).toBeLessThan(3200);
  });
});

it('sends bounded JSON-mode requests with thinking and SDK retries disabled', async () => {
  const requests: string[] = [];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => {
      body += String(chunk);
    });
    request.on('end', () => {
      requests.push(body);
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({
          id: 'local-validation',
          object: 'chat.completion',
          created: 1,
          model: 'deepseek-flash',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '{"reply":"Validated locally"}',
              },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      );
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string')
      return expect.fail('No local test listener');
    const service = new DeepSeekLLMService({
      ...CONFIG,
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
    });
    expect(await service.generateContactAnalysis(INPUT)).toBe(
      'Validated locally',
    );
    expect(requests).toHaveLength(1);
    expect(JSON.parse(requests[0])).toMatchObject({
      max_tokens: 512,
      response_format: { type: 'json_object' },
      thinking: { type: 'disabled' },
      stream: false,
    });
    expect(requests[0]).not.toContain(INPUT.senderEmail);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
