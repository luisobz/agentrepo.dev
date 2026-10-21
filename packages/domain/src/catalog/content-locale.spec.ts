import { describe, expect, it } from 'vitest';
import { contentTranslationsFromJson, localizeContent } from './content-locale';
import { redactPremiumSkill, redactPremiumAgent } from './premium';

const skill = {
  id: 'one',
  slug: 'test',
  title: 'Original',
  description: null,
  content: 'Contenido original',
  type: 'prompt' as const,
  version: '0.1.0',
  relatedLinks: [],
  isPublished: true,
  isPremium: false,
  priceCents: null,
  currency: 'EUR' as const,
  previewContent: null,
  headerImageUrl: null,
  authorId: null,
  authorName: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sourceLocale: 'es' as const,
  translations: { en: { title: 'Translated', content: 'Translated body' } },
};

describe('localized catalog projections', () => {
  it('keeps original registry bytes when no language is requested', () => {
    const result = localizeContent(skill);
    expect(result.content).toBe(skill.content);
    expect(result.contentLocale).toBe('es');
    expect(result).not.toHaveProperty('translations');
    expect(result.availableLocales).toEqual(['en', 'es']);
  });
  it('translates requested prose and falls back to the source', () => {
    expect(localizeContent(skill, 'en')).toMatchObject({
      title: 'Translated',
      content: 'Translated body',
      contentLocale: 'en',
    });
    expect(localizeContent({ ...skill, translations: {} }, 'en')).toMatchObject(
      { content: skill.content, contentLocale: 'es' },
    );
  });
  it('never adds alien body fields to a projection', () => {
    const result = localizeContent(
      {
        ...skill,
        translations: {
          en: {
            content: 'English',
            readmeContent: 'Hidden data',
            files: { 'run.sh': 'modified' },
          },
        },
      },
      'en',
    );
    expect(result).not.toHaveProperty('readmeContent');
    expect(result).not.toHaveProperty('files');
  });
  it('overlays documentation without touching executable bytes or adding paths', () => {
    const tree = [
      {
        name: 'docs',
        type: 'directory' as const,
        children: [
          { name: 'README.md', type: 'file' as const, content: 'Hola' },
        ],
      },
      { name: 'run.sh', type: 'file' as const, content: 'echo hello' },
    ];
    const result = localizeContent(
      {
        sourceLocale: 'es' as const,
        fileTree: tree,
        readmeContent: 'Hola',
        translations: {
          en: {
            readmeContent: 'Hello',
            files: {
              'docs/README.md': 'Hello',
              'run.sh': 'evil',
              '../extra.md': 'evil',
              'extra.md': 'new',
            },
          },
        },
      },
      'en',
    );
    expect(result.fileTree).toEqual([
      {
        ...tree[0],
        children: [{ name: 'README.md', type: 'file', content: 'Hello' }],
      },
      tree[1],
    ]);
    expect(tree[0].children?.[0].content).toBe('Hola');
  });
  it('does not expose translated premium skill or agent bodies', () => {
    const result = redactPremiumSkill(
      localizeContent({ ...skill, isPremium: true }, 'en'),
    );
    expect(result.content).toBe('');
    expect(result).not.toHaveProperty('translations');
    expect(result.contentLocale).toBe('en');
    const {
      content: _content,
      description: _description,
      type: _type,
      ...base
    } = skill;
    const agent = redactPremiumAgent(
      localizeContent(
        {
          ...base,
          shortDescription: 'Agent',
          readmeContent: 'Private',
          fileTree: [],
          repositoryUrl: null,
          isPremium: true,
          translations: {
            en: { readmeContent: 'Private English', content: 'Alien content' },
          },
        },
        'en',
      ),
    );
    expect(agent.readmeContent).toBeNull();
    expect(agent.fileTree).toEqual([]);
    expect(agent).not.toHaveProperty('content');
    expect(agent).not.toHaveProperty('translations');
  });
  it('rejects malformed stored translations and unsafe paths', () => {
    expect(
      contentTranslationsFromJson({
        en: {
          title: 4,
          files: { '../x.md': 'bad', 'safe.md': 'good', 'script.js': 'bad' },
        },
        fr: { title: 'Non' },
      }),
    ).toEqual({ en: { files: { 'safe.md': 'good' } } });
  });
});
