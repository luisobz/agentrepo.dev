import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LocaleProvider } from '@agentrepo/ui';
import { AdminLink } from './admin-link';
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it.each([false, true])(
  'only displays the admin destination for verified admins (%s)',
  async (isAdmin) => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ isAdmin }) });
    vi.stubGlobal('fetch', fetcher);
    render(
      <LocaleProvider>
        <AdminLink />
      </LocaleProvider>,
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    if (isAdmin)
      expect(
        await screen.findByRole('link', { name: 'Admin panel' }),
      ).toHaveAttribute('href', 'https://admin.agentrepo.dev/api/auth/sso');
    else expect(screen.queryByRole('link')).not.toBeInTheDocument();
  },
);
it('removes the link after sign-out without a page navigation', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ isAdmin: true }) });
  vi.stubGlobal('fetch', fetcher);
  render(
    <LocaleProvider>
      <AdminLink />
    </LocaleProvider>,
  );
  await screen.findByRole('link');
  fetcher.mockResolvedValue({
    ok: true,
    json: async () => ({ isAdmin: false }),
  });
  await act(async () => {
    window.dispatchEvent(new Event('auth-session-changed'));
  });
  await waitFor(() =>
    expect(screen.queryByRole('link')).not.toBeInTheDocument(),
  );
});
