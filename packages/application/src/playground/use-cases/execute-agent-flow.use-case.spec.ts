import { describe, expect, it, vi } from 'vitest';
import type {
  CodeGenerationPort,
  CodeValidatorPort,
} from '../ports/code-generation.port';
import {
  AgentFlowEvent,
  ExecuteAgentFlow,
} from './execute-agent-flow.use-case';

const GOOD_CODE = 'export function Feature() { return <div>ok</div>; }';
const BAD_CODE = 'export function Feature() { return <div>ok</div>; ';

async function collect(flow: AsyncGenerator<AgentFlowEvent>) {
  const events: AgentFlowEvent[] = [];
  for await (const event of flow) {
    events.push(event);
  }
  return events;
}

describe('ExecuteAgentFlow', () => {
  it('streams coder → tester → review when validation passes first try', async () => {
    const coder: CodeGenerationPort = {
      generateComponent: vi
        .fn()
        .mockResolvedValue({ code: GOOD_CODE, summary: 'Built the feature' }),
    };
    const validator: CodeValidatorPort = {
      validate: vi.fn().mockResolvedValue([]),
    };

    const events = await collect(
      new ExecuteAgentFlow(coder, validator).execute({ prompt: 'a hero page' })
    );

    expect(events.map((event) => event.type)).toEqual([
      'coder',
      'coder',
      'tester',
      'tester',
      'review',
    ]);
    const review = events.at(-1);
    expect(review).toEqual({
      type: 'review',
      code: GOOD_CODE,
      summary: 'Built the feature',
    });
  });

  it('feeds failures back to the coder with the previous code and report', async () => {
    const generateComponent = vi
      .fn()
      .mockResolvedValueOnce({ code: BAD_CODE, summary: 'first try' })
      .mockResolvedValueOnce({ code: GOOD_CODE, summary: 'fixed' });
    const validate = vi
      .fn()
      .mockResolvedValueOnce([{ message: 'Unbalanced braces' }])
      .mockResolvedValueOnce([]);

    const events = await collect(
      new ExecuteAgentFlow({ generateComponent }, { validate }).execute({
        prompt: 'a hero page',
      })
    );

    expect(generateComponent).toHaveBeenNthCalledWith(2, {
      prompt: 'a hero page',
      previousCode: BAD_CODE,
      errorFeedback: 'Unbalanced braces',
    });
    expect(
      events.some(
        (event) => event.type === 'self-healing' && event.attempt === 1
      )
    ).toBe(true);
    expect(events.at(-1)?.type).toBe('review');
  });

  it('gives up with an error event after two failed repairs', async () => {
    const coder: CodeGenerationPort = {
      generateComponent: vi
        .fn()
        .mockResolvedValue({ code: BAD_CODE, summary: 'still broken' }),
    };
    const validator: CodeValidatorPort = {
      validate: vi.fn().mockResolvedValue([{ message: 'Unbalanced braces' }]),
    };

    const events = await collect(
      new ExecuteAgentFlow(coder, validator).execute({ prompt: 'a hero page' })
    );

    expect(coder.generateComponent).toHaveBeenCalledTimes(3);
    expect(events.at(-1)).toEqual({
      type: 'error',
      detail: expect.stringContaining('2 repair attempts'),
    });
  });

  it('emits an error event when the LLM itself fails', async () => {
    const coder: CodeGenerationPort = {
      generateComponent: vi.fn().mockRejectedValue(new Error('llm quota')),
    };
    const validator: CodeValidatorPort = { validate: vi.fn() };

    const events = await collect(
      new ExecuteAgentFlow(coder, validator).execute({ prompt: 'a hero page' })
    );

    expect(events.at(-1)).toEqual({ type: 'error', detail: 'llm quota' });
    expect(validator.validate).not.toHaveBeenCalled();
  });
});
