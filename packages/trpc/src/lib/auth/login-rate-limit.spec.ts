import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FixedWindowRateLimiter } from './login-rate-limit';

describe('FixedWindowRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows attempts up to the limit inside a window', () => {
    const limiter = new FixedWindowRateLimiter({ maxAttempts: 3, windowMs: 1_000 });

    expect(limiter.consume('ip-1')).toBe(true);
    expect(limiter.consume('ip-1')).toBe(true);
    expect(limiter.consume('ip-1')).toBe(true);
    expect(limiter.consume('ip-1')).toBe(false);
  });

  it('tracks keys independently', () => {
    const limiter = new FixedWindowRateLimiter({ maxAttempts: 1, windowMs: 1_000 });

    expect(limiter.consume('ip-1')).toBe(true);
    expect(limiter.consume('ip-2')).toBe(true);
    expect(limiter.consume('ip-1')).toBe(false);
  });

  it('allows again once the window has elapsed', () => {
    const limiter = new FixedWindowRateLimiter({ maxAttempts: 1, windowMs: 1_000 });

    expect(limiter.consume('ip-1')).toBe(true);
    expect(limiter.consume('ip-1')).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(limiter.consume('ip-1')).toBe(true);
  });

  it('clears a key on reset (successful login)', () => {
    const limiter = new FixedWindowRateLimiter({ maxAttempts: 1, windowMs: 1_000 });

    expect(limiter.consume('ip-1')).toBe(true);
    limiter.reset('ip-1');
    expect(limiter.consume('ip-1')).toBe(true);
  });
});
