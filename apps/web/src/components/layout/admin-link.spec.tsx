import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LocaleProvider } from '@agentrepo/ui';
import { AdminLink, useAdminAccess } from './admin-link';
function AccessLinks() {
  const isAdmin = useAdminAccess();
  return (
    <>
      <AdminLink isAdmin={isAdmin} />
      <AdminLink isAdmin={isAdmin} />
    </>
  );
}
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
        <AccessLinks />
      </LocaleProvider>,
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    if (isAdmin)
      expect(
        (await screen.findAllByRole('link', { name: 'Admin panel' }))[0],
      ).toHaveAttribute('href', 'https://admin.agentrepo.dev/api/auth/sso');
    else expect(screen.queryAllByRole('link')).toHaveLength(0);
  },
);
it('removes the link after sign-out without a page navigation', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ isAdmin: true }) });
  vi.stubGlobal('fetch', fetcher);
  render(
    <LocaleProvider>
      <AccessLinks />
    </LocaleProvider>,
  );
  await screen.findAllByRole('link');
  fetcher.mockResolvedValue({
    ok: true,
    json: async () => ({ isAdmin: false }),
  });
  await act(async () => {
    window.dispatchEvent(new Event('auth-session-changed'));
  });
  await waitFor(() => expect(screen.queryAllByRole('link')).toHaveLength(0));
});
