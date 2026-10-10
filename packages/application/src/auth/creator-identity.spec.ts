import { describe, expect, it, vi } from 'vitest';
import {
  ResolveCreatorIdentity,
  type ContributorIdentity,
} from './creator-identity';

describe('ResolveCreatorIdentity', () => {
  it('never provisions a user from an unverified session', async () => {
    const contributors = { findOrCreate: vi.fn() };
    const resolver = new ResolveCreatorIdentity({
      contributors,
      sessions: { verify: vi.fn().mockResolvedValue(null) },
    });
    expect(await resolver.execute('invalid')).toBeNull();
    expect(contributors.findOrCreate).not.toHaveBeenCalled();
  });
  it('provisions only the identity returned by the verifier', async () => {
    const identity: ContributorIdentity = {
      providerUserId: 'verified-id',
      email: 'member@example.test',
      name: 'Member',
      provider: 'github',
    };
    const contributors = {
      findOrCreate: vi.fn().mockResolvedValue('local-member'),
    };
    const resolver = new ResolveCreatorIdentity({
      contributors,
      sessions: { verify: vi.fn().mockResolvedValue(identity) },
    });
    expect(await resolver.execute('session')).toBe('local-member');
    expect(contributors.findOrCreate).toHaveBeenCalledWith(identity);
  });
});
