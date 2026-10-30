import { expect, it } from 'vitest';
import { readingSummaryFromJson } from './reading-summary';
import { localizeBlogPost } from './blog-post';

it('accepts bounded plain summaries and rejects malformed stored data', () => {
  const value = {
    summary: 'A clear explanation.',
    points: ['What happened', 'Why it matters'],
  };
  expect(readingSummaryFromJson(value)).toEqual(value);
  for (const invalid of [
    null,
    [],
    { summary: 7 },
    { summary: 'x'.repeat(1201), points: [] },
    { summary: 'text', points: ['one', 'two', 'three', 'four'] },
  ]) {
    expect(readingSummaryFromJson(invalid)).toBeNull();
  }
});
it('selects summaries in the actual body language without mixing translations', () => {
  const post = {
    sourceLocale: 'es' as const,
    content: 'Original',
    lazyRead: { summary: 'Resumen original', points: [] },
    translations: {
      en: {
        content: 'Translation',
        lazyRead: { summary: 'English summary', points: [] },
      },
    },
  };
  expect(localizeBlogPost(post, 'en').lazyRead?.summary).toBe(
    'English summary',
  );
  expect(localizeBlogPost(post, 'es').lazyRead?.summary).toBe(
    'Resumen original',
  );
  expect(
    localizeBlogPost(
      { ...post, translations: { en: { content: 'Translation' } } },
      'en',
    ).lazyRead,
  ).toBeNull();
  expect(
    localizeBlogPost(
      {
        ...post,
        translations: {
          en: { lazyRead: { summary: 'English summary', points: [] } },
        },
      },
      'en',
    ).lazyRead?.summary,
  ).toBe('Resumen original');
});
