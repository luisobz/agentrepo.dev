import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { PublishBlogButton } from './publish-button';

const { publish, refresh } = vi.hoisted(() => ({
  publish: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock('../../app/blog/review/actions', () => ({
  publishReviewedPost: publish,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('publishes only after an explicit click and reports failure without hiding the draft', async () => {
  publish.mockResolvedValue({ error: true });
  render(<PublishBlogButton id="draft-id" locale="es" />);
  expect(publish).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Publicar artículo' }));
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain(
      'No se ha podido publicar',
    ),
  );
  expect(publish).toHaveBeenCalledWith('draft-id');
  expect(refresh).not.toHaveBeenCalled();
});
