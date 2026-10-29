import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { LocaleProvider } from '@agentrepo/ui';
import { VersionHistory } from './version-history';
afterEach(cleanup);
const versions = ['1.0.0', '0.9.0'].map((version, index) => ({
  id: version,
  version,
  isLatest: index === 0,
  changelog: null,
  createdAt: new Date('2026-10-10'),
  downloadsTotal: 0,
  downloadsWeekly: 0,
}));
it('pins every skill history link, including latest', () => {
  render(
    <LocaleProvider>
      <VersionHistory
        versions={versions}
        basePath="/skills/writer"
        currentVersion="0.9.0"
        versionedPaths
      />
    </LocaleProvider>,
  );
  expect(screen.getByRole('link', { name: '1.0.0' })).toHaveAttribute(
    'href',
    '/en/skills/writer/1.0.0',
  );
  expect(screen.getByRole('link', { name: '0.9.0' })).toHaveAttribute(
    'href',
    '/en/skills/writer/0.9.0',
  );
});
it('preserves existing agent history routes', () => {
  render(
    <LocaleProvider>
      <VersionHistory
        versions={versions}
        basePath="/agents/example"
        currentVersion="1.0.0"
      />
    </LocaleProvider>,
  );
  expect(screen.getByRole('link', { name: '0.9.0' })).toHaveAttribute(
    'href',
    '/en/agents/example?version=0.9.0',
  );
});
