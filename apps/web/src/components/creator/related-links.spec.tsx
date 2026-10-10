import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { LocaleProvider, RelatedLinks } from '@agentrepo/ui';
afterEach(cleanup);
it('shows labelled source links without embedding third-party widgets', () => {
  render(
    <LocaleProvider>
      <RelatedLinks
        links={[
          { kind: 'x', label: 'Creator on X', url: 'https://x.com/creator' },
          {
            kind: 'github',
            label: 'Source code',
            url: 'https://github.com/owner/project',
          },
        ]}
      />
    </LocaleProvider>,
  );
  const link = screen.getByRole('link', { name: /Creator on X/ });
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer ugc');
  expect(screen.getByRole('link', { name: /Source code/ })).toHaveAttribute(
    'href',
    'https://github.com/owner/project',
  );
  expect(document.querySelector('iframe')).toBeNull();
});
it('does not show an empty references section', () => {
  render(
    <LocaleProvider>
      <RelatedLinks />
    </LocaleProvider>,
  );
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
