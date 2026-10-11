import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { LocaleProvider } from '@agentrepo/ui';
import { AdminNavigation } from './admin-navigation';
const { path } = vi.hoisted(() => ({ path: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: path,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('../../lib/i18n/use-t', async () => {
  const { adminDictionary } = await import('../../lib/i18n/dictionary');
  return {
    useT: () => (key: keyof typeof adminDictionary) => adminDictionary[key].en,
  };
});
beforeEach(() => path.mockReturnValue('/admin/agents/existing-id'));
afterEach(cleanup);
it('offers an immediate return to the public website and marks nested pages active', () => {
  render(
    <LocaleProvider>
      <AdminNavigation />
    </LocaleProvider>,
  );
  expect(screen.getByRole('link', { name: 'View website' })).toHaveAttribute(
    'href',
    'https://agentrepo.dev',
  );
  expect(screen.getByRole('link', { name: 'Agents' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
    'aria-current',
  );
});
it('toggles mobile navigation, closes on selection and restores focus with Escape', () => {
  render(
    <LocaleProvider>
      <AdminNavigation />
    </LocaleProvider>,
  );
  const toggle = screen.getByRole('button', { name: 'Open navigation' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(screen.getByRole('navigation'), { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole('link', { name: 'Skills' }));
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
