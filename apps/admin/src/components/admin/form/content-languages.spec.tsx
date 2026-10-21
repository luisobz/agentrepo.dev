import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ContentLanguages, useContentLanguages } from './content-languages';

vi.mock('./monaco-field', () => ({
  MonacoField: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
}));
function Editor() {
  const languages = useContentLanguages({ sourceLocale: 'es' });
  return (
    <>
      <ContentLanguages
        kind="agent"
        value={languages}
        fileTree={[
          { name: 'README.md', type: 'file', content: 'Hola' },
          { name: 'run.sh', type: 'file', content: 'echo hello' },
        ]}
      />
      <output data-testid="languages">
        {JSON.stringify({
          sourceLocale: languages.sourceLocale,
          translations: languages.translations,
        })}
      </output>
    </>
  );
}
it('edits a translation and only offers existing Markdown document paths', () => {
  render(<Editor />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'English' }));
  fireEvent.change(screen.getByLabelText('English · Title / Título'), {
    target: { value: 'Agent guide' },
  });
  fireEvent.change(screen.getByLabelText('English · README.md'), {
    target: { value: '# Hello' },
  });
  expect(screen.queryByLabelText(/run.sh/)).toBeNull();
  expect(
    JSON.parse(screen.getByTestId('languages').textContent ?? '{}'),
  ).toEqual({
    sourceLocale: 'es',
    translations: {
      en: { title: 'Agent guide', files: { 'README.md': '# Hello' } },
    },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: 'English' }));
  expect(
    JSON.parse(screen.getByTestId('languages').textContent ?? '{}')
      .translations,
  ).toEqual({});
});
