import { describe, expect, it } from 'vitest';
import {
  compareSemver,
  isValidSemver,
  nextMajor,
  nextMinor,
  nextPatch,
} from './asset-version';

describe('semver helpers', () => {
  it('validates x.y.z strings only', () => {
    expect(isValidSemver('1.0.0')).toBe(true);
    expect(isValidSemver('10.22.333')).toBe(true);
    expect(isValidSemver('1.0')).toBe(false);
    expect(isValidSemver('v1.0.0')).toBe(false);
    expect(isValidSemver('1.0.0-beta')).toBe(false);
  });

  it('compares versions numerically, not lexically', () => {
    expect(compareSemver('1.9.0', '1.10.0')).toBeLessThan(0);
    expect(compareSemver('2.0.0', '1.99.99')).toBeGreaterThan(0);
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
  });

  it('suggests the next patch/minor/major', () => {
    expect(nextPatch('1.2.3')).toBe('1.2.4');
    expect(nextMinor('1.2.3')).toBe('1.3.0');
    expect(nextMajor('1.2.3')).toBe('2.0.0');
  });
});
