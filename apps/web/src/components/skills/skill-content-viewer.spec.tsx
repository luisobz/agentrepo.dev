import '@testing-library/jest-dom/vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarkdownContent } from '@agentrepo/ui';
import { SkillContentViewer } from './skill-content-viewer';

vi.mock('../utils/trpc', () => ({
  trpc: {
    skills: { recordDownload: { useMutation: () => ({ mutate: vi.fn() }) } },
  },
}));
afterEach(cleanup);

const source =
  '---\nname: example\ndescription: Internal metadata\n---\n\n# Instructions\n\nUse **clear language**.\n\n---\n\nKeep this separator.';

describe('skill document presentation', () => {
  it('hides frontmatter in the readable view and preserves body formatting', () => {
    render(<SkillContentViewer content={source} downloadFileName="SKILL.md" />);
    expect(screen.getByRole('heading', { name: 'Instructions' })).toBeVisible();
    expect(screen.queryByText(/Internal metadata/)).not.toBeInTheDocument();
    expect(screen.getByText('clear language').tagName).toBe('STRONG');
    expect(document.querySelectorAll('hr')).toHaveLength(1);
  });

  it('retains the exact document in Raw and Copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<SkillContentViewer content={source} downloadFileName="SKILL.md" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Raw' }));
    expect(document.querySelector('pre code')?.textContent).toBe(source);
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Copy', exact: true }),
      );
    });
    expect(writeText).toHaveBeenCalledWith(source);
  });

  it('keeps incomplete frontmatter and ordinary separators visible', () => {
    render(
      <SkillContentViewer
        content={'---\n\n# Plain document\n\nBody'}
        downloadFileName="SKILL.md"
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Plain document' }),
    ).toBeVisible();
    expect(document.querySelectorAll('hr')).toHaveLength(1);
  });

  it('leaves other markdown renderers unchanged', () => {
    render(<MarkdownContent content={source} />);
    expect(screen.getByText(/Internal metadata/)).toBeVisible();
  });
});
