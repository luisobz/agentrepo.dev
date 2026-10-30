import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LazyRead } from '@agentrepo/ui';
import { blogReadingSummary } from './reading-summary';

describe('blog reading summary', () => {
  it('prefers curated text and falls back to excerpt or first prose paragraph', () => {
    const lazyRead = { summary: 'Curated', points: ['One'] };
    expect(
      blogReadingSummary({ lazyRead, excerpt: 'Excerpt', content: 'Body' }),
    ).toEqual(lazyRead);
    expect(
      blogReadingSummary({ excerpt: ' Excerpt ', content: 'Body' }).summary,
    ).toBe('Excerpt');
    expect(
      blogReadingSummary({
        excerpt: '',
        content: '# Title\n\nA **simple** [link](https://example.com).',
      }).summary,
    ).toBe('A simple link.');
    expect(
      blogReadingSummary({ excerpt: '', content: '# Title' }).summary,
    ).toBe('');
  });
  it('renders one closed native disclosure and treats content as plain text', () => {
    const { container } = render(
      <LazyRead
        locale="es"
        summary={'<script>alert(1)</script>'}
        points={['Qué ocurrió']}
      />,
    );
    const details = screen.getByTestId('lazy-read');
    expect(details.hasAttribute('open')).toBe(false);
    expect(screen.queryByText('Un resumen sencillo')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('<script>alert(1)</script>')).toBeTruthy();
    fireEvent.click(screen.getByText('Lazy Read'));
    expect(details.hasAttribute('open')).toBe(true);
    fireEvent.click(screen.getByText('Lazy Read'));
    expect(details.hasAttribute('open')).toBe(false);
  });
});
