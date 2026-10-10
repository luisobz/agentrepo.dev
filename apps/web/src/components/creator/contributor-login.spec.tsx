import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LocaleProvider } from '@agentrepo/ui';
import { ContributorLogin } from './contributor-login';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('offers GitHub immediately and reveals email access without navigating away', () => {
  render(
    <LocaleProvider>
      <ContributorLogin />
    </LocaleProvider>,
  );
  const github = screen.getByRole('button', { name: 'Connect with GitHub' });
  expect(github.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Use email instead' }));
  expect(screen.getByLabelText('Email')).toBeVisible();
  expect(screen.getByLabelText('Password')).toBeVisible();
  expect(
    screen.queryByRole('link', { name: /sign in/i }),
  ).not.toBeInTheDocument();
});

it('shows GitHub connection errors while email access stays collapsed', async () => {
  vi.stubEnv('NEXT_PUBLIC_GITHUB_AUTH_ENABLED', 'true');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-test-key');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Offline')));
  render(
    <LocaleProvider>
      <ContributorLogin />
    </LocaleProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Connect with GitHub' }));
  expect(await screen.findByRole('alert')).toBeVisible();
  expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
});
