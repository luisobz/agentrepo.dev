export interface GenerateComponentInput {
  /** The user's feature request, e.g. "profile form with avatar upload". */
  prompt: string;
  /** Code produced by the previous attempt, present on self-healing retries. */
  previousCode?: string;
  /** Failure report from the validator, present on self-healing retries. */
  errorFeedback?: string;
}

export interface GeneratedComponent {
  /** Self-contained React/TypeScript component source. */
  code: string;
  /** Short human summary of what was built. */
  summary: string;
}

/** LLM port used by the playground CoderAgent. */
export interface CodeGenerationPort {
  generateComponent(input: GenerateComponentInput): Promise<GeneratedComponent>;
}

export interface CodeValidationIssue {
  message: string;
}

/**
 * TesterAgent port: validates generated code (syntax/shape checks — the
 * playground never executes untrusted code on the server).
 */
export interface CodeValidatorPort {
  validate(code: string): Promise<CodeValidationIssue[]>;
}
