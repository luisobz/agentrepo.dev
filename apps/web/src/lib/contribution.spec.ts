import { expect, it } from 'vitest';
import { contributionHref, contributionKind } from './contribution';
it('only accepts known contribution kinds and builds local destinations', () => {
  expect(contributionHref(contributionKind('agent'))).toBe(
    '/creator?type=agent',
  );
  for (const value of ['https://evil.test', '//evil.test', ['blog'], null]) {
    expect(contributionKind(value)).toBeUndefined();
    expect(contributionHref(contributionKind(value))).toBe('/creator');
  }
});
