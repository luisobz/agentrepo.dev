import { describe, expect, it } from 'vitest';
import { safeReturnPath } from './return-path';

describe('authentication return path', () => {
  it.each([
    null,
    '',
    '//evil.test',
    '/\\evil.test',
    'https://evil.test',
    '/%5cevil.test',
    '/%2fevil.test',
  ])('rejects external or ambiguous redirects: %s', (path) => {
    expect(safeReturnPath(path)).toBe('/creator');
  });
  it('preserves a local destination', () => {
    expect(safeReturnPath('/creator?draft=one')).toBe('/creator?draft=one');
  });
});
