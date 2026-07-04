/**
 * In-memory fixed-window rate limiter for login endpoints. Suitable for the
 * single-instance Next.js apps in this repo; a multi-instance deployment
 * should replace it with a shared store (e.g. Redis).
 */

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
}

interface WindowState {
  count: number;
  windowStart: number;
}

const PRUNE_THRESHOLD = 1_000;

export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, WindowState>();

  constructor(private readonly options: RateLimitOptions) {}

  /** Records an attempt for the key and reports whether it is allowed. */
  consume(key: string): boolean {
    const now = Date.now();
    this.pruneIfNeeded(now);

    const current = this.windows.get(key);
    if (!current || now - current.windowStart >= this.options.windowMs) {
      this.windows.set(key, { count: 1, windowStart: now });
      return true;
    }

    current.count += 1;
    return current.count <= this.options.maxAttempts;
  }

  /** Forgets a key, e.g. after a successful login. */
  reset(key: string): void {
    this.windows.delete(key);
  }

  private pruneIfNeeded(now: number): void {
    if (this.windows.size < PRUNE_THRESHOLD) {
      return;
    }
    for (const [key, state] of this.windows) {
      if (now - state.windowStart >= this.options.windowMs) {
        this.windows.delete(key);
      }
    }
  }
}
