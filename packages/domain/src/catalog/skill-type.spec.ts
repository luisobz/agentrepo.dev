import { describe, it, expect } from 'vitest';
import { assertSkillType, isSkillType, SKILL_TYPES } from './skill';
import { DataIntegrityError } from '../errors/domain.error';

describe('isSkillType', () => {
  it('accepts every declared skill type', () => {
    for (const type of SKILL_TYPES) {
      expect(isSkillType(type)).toBe(true);
    }
  });

  it('rejects unknown strings and non-strings', () => {
    expect(isSkillType('unknown')).toBe(false);
    expect(isSkillType('')).toBe(false);
    expect(isSkillType(null)).toBe(false);
    expect(isSkillType(123)).toBe(false);
  });
});

describe('assertSkillType', () => {
  it('returns the value for a valid skill type', () => {
    expect(assertSkillType('prompt')).toBe('prompt');
  });

  it('throws DataIntegrityError for an invalid skill type', () => {
    expect(() => assertSkillType('nope')).toThrow(DataIntegrityError);
    expect(() => assertSkillType(undefined)).toThrow(DataIntegrityError);
  });
});
