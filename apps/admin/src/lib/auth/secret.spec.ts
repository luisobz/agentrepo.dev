import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getAuthSecret } from './secret';

describe('getAuthSecret', () => {
  const original = process.env.AUTH_SECRET;

  beforeEach(() => {
    delete process.env.AUTH_SECRET;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = original;
    }
  });

  it('returns the secret when AUTH_SECRET is set', () => {
    process.env.AUTH_SECRET = 'super-secret';
    expect(getAuthSecret()).toBe('super-secret');
  });

  it('returns null when AUTH_SECRET is unset', () => {
    delete process.env.AUTH_SECRET;
    expect(getAuthSecret()).toBeNull();
  });

  it('returns null when AUTH_SECRET is an empty string', () => {
    process.env.AUTH_SECRET = '';
    expect(getAuthSecret()).toBeNull();
  });
});
