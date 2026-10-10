import { afterEach, expect, it, vi } from 'vitest';
import {
  createAdminHandoff,
  hashAdminNonce,
  openAdminHandoff,
} from './admin-handoff';

afterEach(() => vi.useRealTimers());

it('encrypts provider credentials and binds the handoff to the initiating browser', async () => {
  const challenge = await hashAdminNonce('browser-private-nonce');
  const ticket = await createAdminHandoff({
    token: 'provider-secret',
    challenge,
    secret: 'server-secret',
  });
  expect(ticket).not.toContain('provider-secret');
  expect(
    await openAdminHandoff(ticket, 'browser-private-nonce', 'server-secret'),
  ).toBe('provider-secret');
  expect(await openAdminHandoff(ticket, challenge, 'server-secret')).toBeNull();
  expect(
    await openAdminHandoff(ticket, 'different-browser', 'server-secret'),
  ).toBeNull();
  expect(
    await openAdminHandoff(ticket, 'browser-private-nonce', 'wrong-secret'),
  ).toBeNull();
  expect(
    await openAdminHandoff(
      ticket.slice(1),
      'browser-private-nonce',
      'server-secret',
    ),
  ).toBeNull();
});

it('expires after sixty seconds and fails closed for missing inputs', async () => {
  vi.useFakeTimers();
  const ticket = await createAdminHandoff({
    token: 'provider-secret',
    challenge: await hashAdminNonce('nonce'),
    secret: 'secret',
  });
  vi.advanceTimersByTime(60_000);
  expect(await openAdminHandoff(ticket, 'nonce', 'secret')).toBeNull();
  expect(await openAdminHandoff(ticket, '', 'secret')).toBeNull();
  expect(await openAdminHandoff(ticket, 'nonce', '')).toBeNull();
});
