import { describe, expect, it } from 'vitest';
import { adminReturnPath } from './return-path';

describe('admin return paths', () => {
  it.each([
    null,
    'javascript:alert(1)',
    'https://example.test',
    '//example.test',
    '/admin\\evil',
    '/admin/%2f%2fevil',
    '/other',
  ])('rejects unsafe destinations: %s', (value) => {
    expect(adminReturnPath(value)).toBe('/admin');
  });
  it('preserves an admin review destination', () => {
    expect(adminReturnPath('/admin/review')).toBe('/admin/review');
  });
});
