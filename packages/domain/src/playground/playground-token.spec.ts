import { describe, it, expect } from 'vitest';
import { PlaygroundToken, isPlaygroundTokenUsable } from './playground-token';

const NOW = new Date('2024-06-01T00:00:00.000Z');

function buildToken(overrides: Partial<PlaygroundToken> = {}): PlaygroundToken {
  return {
    id: 'token-1',
    token: 'abc',
    label: 'demo',
    maxUses: 5,
    usesCount: 0,
    expiresAt: new Date('2024-12-01T00:00:00.000Z'),
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe('isPlaygroundTokenUsable', () => {
  it('returns true for an active, unexhausted, unexpired token', () => {
    expect(isPlaygroundTokenUsable(buildToken(), NOW)).toBe(true);
  });

  it('returns false when the token is inactive', () => {
    expect(isPlaygroundTokenUsable(buildToken({ isActive: false }), NOW)).toBe(false);
  });

  it('returns false when uses are exhausted', () => {
    expect(
      isPlaygroundTokenUsable(buildToken({ usesCount: 5, maxUses: 5 }), NOW)
    ).toBe(false);
  });

  it('returns false when the token has expired', () => {
    expect(
      isPlaygroundTokenUsable(
        buildToken({ expiresAt: new Date('2024-01-01T00:00:00.000Z') }),
        NOW
      )
    ).toBe(false);
  });

  it('returns false when expiry equals now (strictly greater required)', () => {
    expect(isPlaygroundTokenUsable(buildToken({ expiresAt: NOW }), NOW)).toBe(false);
  });
});
