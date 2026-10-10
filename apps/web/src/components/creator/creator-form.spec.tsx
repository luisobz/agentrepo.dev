import '@testing-library/jest-dom/vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocaleProvider } from '@agentrepo/ui';
import { CreatorForm } from './creator-form';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('creator proposals', () => {
  it.each(['skill', 'agent', 'blog'])(
    'submits %s without trusting publication or author input',
    async (kind) => {
      const fetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetch);
      render(
        <LocaleProvider>
          <CreatorForm authorName="Contributor" />
        </LocaleProvider>,
      );
      fireEvent.click(
        screen.getByRole('radio', {
          name:
            kind === 'skill' ? 'Skill' : kind === 'agent' ? 'Agent' : 'Blog',
        }),
      );
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'My contribution' },
      });
      fireEvent.change(
        screen.getByLabelText(
          kind === 'blog' ? 'Article summary' : 'Description',
        ),
        { target: { value: 'A clear summary' } },
      );
      fireEvent.change(screen.getByRole('textbox', { name: /Markdown\)/ }), {
        target: { value: '# Documented contribution' },
      });
      fireEvent.click(
        screen.getByRole('button', { name: 'Submit draft for review' }),
      );
      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Draft submitted'),
      );
      const payload = JSON.parse(fetch.mock.calls[0][1].body);
      expect(payload.kind).toBe(kind);
      expect(payload.slug).toBe('my-contribution');
      expect(payload).not.toHaveProperty('authorId');
      expect(payload).not.toHaveProperty('isPublished');
    },
  );

  it('retains the draft and shows an error when the server rejects it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'That slug is already in use' }),
      }),
    );
    render(
      <LocaleProvider>
        <CreatorForm authorName="Contributor" />
      </LocaleProvider>,
    );
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Existing title' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Markdown\)/ }), {
      target: { value: 'Draft content' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Submit draft for review' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('already in use'),
    );
    expect(screen.getByLabelText('Title')).toHaveValue('Existing title');
  });
});
