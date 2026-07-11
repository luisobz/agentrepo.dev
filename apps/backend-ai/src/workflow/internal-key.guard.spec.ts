import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { InternalKeyGuard } from './internal-key.guard';

// In the test process DATABASE_URL is set and NODE_ENV is unset (→ development),
// so BackendEnvironments.INTERNAL_COMMUNICATION_API_SECRET is the default 'dev-internal-secret'.
const VALID_KEY = 'dev-internal-secret';

function contextWithKey(value: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { 'x-internal-key': value } }),
    }),
  } as unknown as ExecutionContext;
}

describe('InternalKeyGuard', () => {
  const guard = new InternalKeyGuard();

  it('allows the request when the correct internal key is provided', () => {
    expect(guard.canActivate(contextWithKey(VALID_KEY))).toBe(true);
  });

  it('throws UnauthorizedException for a wrong key of equal length', () => {
    const wrongSameLength = 'x'.repeat(VALID_KEY.length);
    expect(() => guard.canActivate(contextWithKey(wrongSameLength))).toThrow(
      UnauthorizedException
    );
  });

  it('throws UnauthorizedException when the header is missing', () => {
    expect(() => guard.canActivate(contextWithKey(undefined))).toThrow(
      UnauthorizedException
    );
  });

  it('throws UnauthorizedException when the key has the wrong length', () => {
    expect(() => guard.canActivate(contextWithKey('too-short'))).toThrow(
      UnauthorizedException
    );
    expect(() =>
      guard.canActivate(contextWithKey(VALID_KEY + '-extra'))
    ).toThrow(UnauthorizedException);
  });
});
