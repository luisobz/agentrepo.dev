import { LocaleProvider } from '@agentrepo/ui';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PlaygroundCard } from './playground-card';
import type { PlaygroundCardData } from './playground-types';

// The card reads translations from the locale context; default locale is 'en'.
const renderWithLocale = (ui: ReactElement) =>
  render(<LocaleProvider>{ui}</LocaleProvider>);

function buildCard(overrides: Partial<PlaygroundCardData> = {}): PlaygroundCardData {
  return {
    id: 'card-1',
    title: 'Feature 1: Premium Dark Hero Page',
    column: 'backlog',
    kind: 'mock',
    subtasks: [
      { label: 'Write code', done: true },
      { label: 'Setup tests', done: false },
    ],
    ...overrides,
  };
}

describe('PlaygroundCard', () => {
  it('renders the title and the sub-task checklist', () => {
    renderWithLocale(<PlaygroundCard card={buildCard()} />);

    expect(
      screen.getByText('Feature 1: Premium Dark Hero Page')
    ).toBeTruthy();
    expect(screen.getByText('Write code')).toBeTruthy();
    expect(screen.getByText('Setup tests')).toBeTruthy();
  });

  it('shows the active agent badge when assigned', () => {
    renderWithLocale(<PlaygroundCard card={buildCard({ agent: 'coder' })} />);

    expect(screen.getByText('[CoderAgent]')).toBeTruthy();
  });

  it('highlights the error state', () => {
    renderWithLocale(
      <PlaygroundCard
        card={buildCard({ hasError: true, errorDetail: 'Security assertion failed' })}
      />
    );

    expect(screen.getByRole('alert').textContent).toContain(
      'Security assertion failed'
    );
  });

  it('only offers the preview action in the review column and fires callbacks', () => {
    const onPreview = vi.fn();
    const { rerender } = renderWithLocale(
      <PlaygroundCard card={buildCard()} onPreview={onPreview} />
    );
    expect(screen.queryByText('View preview')).toBeNull();

    rerender(
      <LocaleProvider>
        <PlaygroundCard
          card={buildCard({ column: 'review' })}
          onPreview={onPreview}
        />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByText('View preview'));

    expect(onPreview).toHaveBeenCalledWith('card-1');
  });
});
