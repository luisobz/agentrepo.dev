import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ContentCover } from './content-cover';
afterEach(cleanup);
describe('cover image sources', () => {
  it.each([
    'javascript:alert(1)',
    'data:image/svg+xml,<svg onload="alert(1)"/>',
    'http://unsafe.test/image.png',
    '//unsafe.test/image.png',
  ])('rejects unsafe sources: %s', (imageUrl) => {
    const { container } = render(
      <ContentCover title="Safe title" kind="agent" imageUrl={imageUrl} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('Safe title');
  });
  it('keeps a legitimate HTTPS image', () => {
    const { container } = render(
      <ContentCover
        title="Title"
        kind="agent"
        imageUrl="https://images.example.test/cover.png"
      />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://images.example.test/cover.png',
    );
  });
});
