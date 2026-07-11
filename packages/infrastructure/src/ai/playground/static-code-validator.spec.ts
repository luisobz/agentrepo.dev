import { describe, expect, it } from 'vitest';
import { StaticCodeValidator } from './static-code-validator';

const VALID_COMPONENT = `
export default function HeroSection() {
  return (
    <section className="p-8">
      <h1>Hello {'{world}'}</h1>
    </section>
  );
}
`;

describe('StaticCodeValidator', () => {
  const validator = new StaticCodeValidator();

  it('accepts a well-formed self-contained component', async () => {
    expect(await validator.validate(VALID_COMPONENT)).toEqual([]);
  });

  it('flags unbalanced braces', async () => {
    const issues = await validator.validate(
      'export default function X() { return (<div>ok</div>); '
    );
    expect(issues.some((issue) => issue.message.includes('Unclosed'))).toBe(true);
  });

  it('flags forbidden constructs like network calls', async () => {
    const issues = await validator.validate(
      `export default function X() {
        fetch('https://evil.example.com');
        return (<div>ok</div>);
      }`
    );
    expect(
      issues.some((issue) => issue.message.includes('network calls'))
    ).toBe(true);
  });

  it('requires an exported component that renders JSX', async () => {
    const issues = await validator.validate('const x = 1;');
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});
