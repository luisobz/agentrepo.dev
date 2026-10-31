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
import { readAgentUpload } from './read-agent-upload';
vi.mock('./read-agent-upload', () => ({ readAgentUpload: vi.fn() }));
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

it('preserves labelled references in a contribution', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetcher);
  render(
    <LocaleProvider>
      <CreatorForm authorName="Contributor" />
    </LocaleProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add link' }));
  fireEvent.change(screen.getByLabelText('Link type 1'), {
    target: { value: 'x' },
  });
  fireEvent.change(screen.getByLabelText('Link label 1'), {
    target: { value: 'Creator on X' },
  });
  fireEvent.change(screen.getByLabelText('Link URL 1'), {
    target: { value: 'https://x.com/creator' },
  });
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Linked asset' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Markdown\)/ }), {
    target: { value: '# Description' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Submit draft for review' }),
  );
  await waitFor(() => expect(fetcher).toHaveBeenCalled());
  expect(JSON.parse(fetcher.mock.calls[0][1].body).relatedLinks).toEqual([
    { kind: 'x', label: 'Creator on X', url: 'https://x.com/creator' },
  ]);
});

it('previews imported agent sources, fills README and submits the full package for review', async () => {
  const files = [
    { path: 'README.md', content: '# Imported agent' },
    { path: 'src/main.py', content: 'print(1)' },
  ];
  vi.mocked(readAgentUpload).mockResolvedValue(files);
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetch);
  render(
    <LocaleProvider>
      <CreatorForm authorName="Contributor" />
    </LocaleProvider>,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Agent' }));
  fireEvent.change(screen.getByLabelText('Upload source files or a ZIP'), {
    target: { files: [new File(['zip'], 'agent.zip')] },
  });
  await waitFor(() =>
    expect(
      screen.getByRole('list', { name: 'Source package files' }),
    ).toHaveTextContent('src/main.py'),
  );
  expect(screen.getByRole('textbox', { name: /Markdown\)/ })).toHaveValue(
    '# Imported agent',
  );
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Imported agent' },
  });
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Documented source package' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Submit draft for review' }),
  );
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(JSON.parse(fetch.mock.calls[0][1].body).files).toEqual(files);
});

it('keeps an existing source package when a later ZIP is rejected', async () => {
  vi.mocked(readAgentUpload)
    .mockResolvedValueOnce([{ path: 'main.py', content: 'print(1)' }])
    .mockRejectedValueOnce(new Error('Unsafe file path'));
  render(
    <LocaleProvider>
      <CreatorForm authorName="Contributor" />
    </LocaleProvider>,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Agent' }));
  const input = screen.getByLabelText('Upload source files or a ZIP');
  fireEvent.change(input, {
    target: { files: [new File(['zip'], 'good.zip')] },
  });
  await waitFor(() =>
    expect(
      screen.getByRole('list', { name: 'Source package files' }),
    ).toHaveTextContent('main.py'),
  );
  fireEvent.change(input, {
    target: { files: [new File(['zip'], 'bad.zip')] },
  });
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Unsafe file path'),
  );
  expect(
    screen.getByRole('list', { name: 'Source package files' }),
  ).toHaveTextContent('main.py');
});

it('starts with the contribution type chosen from its catalogue', () => {
  render(
    <LocaleProvider>
      <CreatorForm authorName="Contributor" initialKind="agent" />
    </LocaleProvider>,
  );
  expect(
    screen.getByRole('radio', { name: 'Agent', exact: true }),
  ).toBeChecked();
});
