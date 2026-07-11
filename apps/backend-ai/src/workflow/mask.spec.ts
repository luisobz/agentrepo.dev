import { describe, it, expect } from 'vitest';
import { maskSensitiveData } from './mask';

describe('maskSensitiveData', () => {
  it('redacts an email inside a plain string', () => {
    expect(maskSensitiveData({ data: 'contact jane.doe@company.com now' })).toBe(
      'contact [redacted-email] now'
    );
  });

  it('redacts emails nested in objects and arrays', () => {
    const masked = maskSensitiveData({
      data: {
        subject: 'employment',
        from: 'a@b.io',
        messages: ['reach me at x.y@z.co', 'no email here'],
      },
    });

    expect(masked).toEqual({
      subject: 'employment',
      from: '[redacted-email]',
      messages: ['reach me at [redacted-email]', 'no email here'],
    });
  });

  it('leaves non-PII data untouched', () => {
    expect(maskSensitiveData({ data: { count: 3, ok: true } })).toEqual({
      count: 3,
      ok: true,
    });
    expect(maskSensitiveData({ data: null })).toBeNull();
  });
});
