import type {
  CodeGenerationPort,
  CodeValidatorPort,
} from '../ports/code-generation.port';

export interface ExecuteAgentFlowInput {
  prompt: string;
}

export type AgentFlowEvent =
  | { type: 'coder'; phase: 'start' | 'chunk' | 'done'; detail: string }
  | { type: 'tester'; phase: 'start' | 'passed' | 'failed'; detail: string }
  | { type: 'self-healing'; attempt: number; detail: string }
  | { type: 'review'; code: string; summary: string }
  | { type: 'error'; detail: string };

const MAX_HEALING_ATTEMPTS = 2;

/**
 * Playground orchestrator: CoderAgent writes the component, TesterAgent
 * validates it and failures are fed back to the coder (self-healing loop,
 * capped at MAX_HEALING_ATTEMPTS). Emits a structured event stream the
 * frontend renders live on the Kanban board.
 */
export class ExecuteAgentFlow {
  constructor(
    private readonly coder: CodeGenerationPort,
    private readonly validator: CodeValidatorPort
  ) {}

  async *execute(input: ExecuteAgentFlowInput): AsyncGenerator<AgentFlowEvent> {
    yield {
      type: 'coder',
      phase: 'start',
      detail: 'CoderAgent analysing the requirement and writing the component…',
    };

    let generated;
    try {
      generated = await this.coder.generateComponent({ prompt: input.prompt });
    } catch (error: unknown) {
      yield { type: 'error', detail: describeError(error) };
      return;
    }
    yield { type: 'coder', phase: 'done', detail: generated.summary };

    for (let attempt = 0; attempt <= MAX_HEALING_ATTEMPTS; attempt += 1) {
      yield {
        type: 'tester',
        phase: 'start',
        detail: 'TesterAgent running the validation suite…',
      };
      const issues = await this.validator.validate(generated.code);

      if (issues.length === 0) {
        yield { type: 'tester', phase: 'passed', detail: '✓ Tests passed' };
        yield { type: 'review', code: generated.code, summary: generated.summary };
        return;
      }

      const report = issues.map((issue) => issue.message).join('\n');
      yield { type: 'tester', phase: 'failed', detail: report };

      if (attempt === MAX_HEALING_ATTEMPTS) {
        yield {
          type: 'error',
          detail: `The agent could not stabilise the code after ${MAX_HEALING_ATTEMPTS} repair attempts.`,
        };
        return;
      }

      yield {
        type: 'self-healing',
        attempt: attempt + 1,
        detail: 'Feeding the failure back to CoderAgent for a fix…',
      };
      try {
        generated = await this.coder.generateComponent({
          prompt: input.prompt,
          previousCode: generated.code,
          errorFeedback: report,
        });
      } catch (error: unknown) {
        yield { type: 'error', detail: describeError(error) };
        return;
      }
      yield { type: 'coder', phase: 'done', detail: generated.summary };
    }
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
