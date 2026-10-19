import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { WebAnalytics } from './web-analytics';
const { route } = vi.hoisted(() => ({ route: vi.fn(() => '/skills') }));
vi.mock('next/navigation', () => ({ usePathname: route }));
vi.mock('next/script', () => ({
  default: (props: Record<string, unknown>) => (
    <script data-testid="beacon" {...props} />
  ),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  route.mockReturnValue('/skills');
});
describe('WebAnalytics', () => {
  it('does not load without a valid public identifier', () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN', 'not-a-token');
    render(<WebAnalytics />);
    expect(screen.queryByTestId('beacon')).toBeNull();
  });
  it('never loads on a fresh account or private page', () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN', '1'.repeat(32));
    route.mockReturnValue('/creator');
    render(<WebAnalytics />);
    expect(screen.queryByTestId('beacon')).toBeNull();
  });
  it('loads one beacon with SPA support for public pages', () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN', '1'.repeat(32));
    render(<WebAnalytics />);
    expect(
      JSON.parse(screen.getByTestId('beacon').getAttribute('data-cf-beacon')!),
    ).toEqual({ token: '1'.repeat(32), spa: true });
  });
});
