import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
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
    <VersionHistory
      versions={versions}
      basePath="/skills/writer"
      currentVersion="0.9.0"
      versionedPaths
    />,
  );
  expect(screen.getByRole('link', { name: '1.0.0' })).toHaveAttribute(
    'href',
    '/skills/writer/1.0.0',
  );
  expect(screen.getByRole('link', { name: '0.9.0' })).toHaveAttribute(
    'href',
    '/skills/writer/0.9.0',
  );
});
it('preserves existing agent history routes', () => {
  render(
    <VersionHistory
      versions={versions}
      basePath="/agents/example"
      currentVersion="1.0.0"
    />,
  );
  expect(screen.getByRole('link', { name: '0.9.0' })).toHaveAttribute(
    'href',
    '/agents/example?version=0.9.0',
  );
});
