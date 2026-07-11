import {
  CodeValidationIssue,
  CodeValidatorPort,
} from '@agentrepo/application';

const MAX_CODE_LENGTH = 20_000;

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\bfetch\s*\(/, reason: 'network calls are not allowed' },
  { pattern: /XMLHttpRequest|WebSocket/, reason: 'network APIs are not allowed' },
  { pattern: /\beval\s*\(|new Function\s*\(/, reason: 'dynamic evaluation is not allowed' },
  { pattern: /localStorage|sessionStorage|indexedDB/, reason: 'storage access is not allowed' },
  { pattern: /process\.env|require\s*\(/, reason: 'environment/module access is not allowed' },
  { pattern: /import\s+(?!React\b|\{[^}]*\}\s+from\s+['"]react['"])[^;]*from\s+['"](?!react['"])/, reason: 'only React may be imported' },
];

function checkBalanced(code: string): CodeValidationIssue[] {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: string[] = [];
  // Strings/comments are stripped coarsely so braces inside them don't count.
  const stripped = code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g, '""');
  for (const char of stripped) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.pop() !== pairs[char]) {
        return [{ message: `Unbalanced "${char}" detected in the generated code` }];
      }
    }
  }
  return stack.length > 0
    ? [{ message: `Unclosed "${stack.at(-1)}" detected in the generated code` }]
    : [];
}

/**
 * TesterAgent implementation: static shape/safety checks over the generated
 * component. The playground deliberately never executes untrusted code on
 * the server, so validation is structural.
 */
export class StaticCodeValidator implements CodeValidatorPort {
  async validate(code: string): Promise<CodeValidationIssue[]> {
    const issues: CodeValidationIssue[] = [];

    if (code.trim().length === 0) {
      return [{ message: 'The generated code is empty' }];
    }
    if (code.length > MAX_CODE_LENGTH) {
      issues.push({ message: 'The generated code exceeds the size budget' });
    }
    if (!/export\s+default|export\s+(const|function)/.test(code)) {
      issues.push({ message: 'The component must export a function component' });
    }
    if (!/return\s*\(|return\s*</.test(code)) {
      issues.push({ message: 'The component does not render any JSX' });
    }
    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      if (pattern.test(code)) {
        issues.push({ message: `Forbidden construct: ${reason}` });
      }
    }
    issues.push(...checkBalanced(code));

    return issues;
  }
}
