import { describe, it, expect } from 'vitest';
import {
  createAgentSchema,
  createSkillSchema,
  createBlogPostSchema,
} from './catalog.schemas';

describe('content language validation', () => {
  const skill = {
    slug: 'sample',
    title: 'Skill',
    content: 'Hola',
    type: 'prompt',
    sourceLocale: 'es',
  };
  it('accepts complete translated skill bodies and rejects alien fields', () => {
    expect(
      createSkillSchema.safeParse({
        ...skill,
        translations: { en: { title: 'Skill', content: 'Hello' } },
      }).success,
    ).toBe(true);
    expect(
      createSkillSchema.safeParse({
        ...skill,
        translations: {
          en: { title: 'Skill', content: 'Hello', readmeContent: 'Hidden' },
        },
      }).success,
    ).toBe(false);
    expect(
      createSkillSchema.safeParse({
        ...skill,
        translations: { en: { title: 'Skill' } },
      }).success,
    ).toBe(false);
  });
  it('only accepts supported languages', () => {
    expect(
      createSkillSchema.safeParse({ ...skill, sourceLocale: 'fr' }).success,
    ).toBe(false);
    expect(
      createBlogPostSchema.safeParse({
        slug: 'post',
        title: 'Post',
        content: 'Hola',
        translations: { fr: { title: 'Post', content: 'Bonjour' } },
      }).success,
    ).toBe(false);
  });
  it('limits agent translations to prose and safe Markdown paths', () => {
    const agent = {
      slug: 'agent',
      title: 'Agent',
      shortDescription: 'Agent',
      fileTree: [],
    };
    const translation = {
      title: 'Agent',
      shortDescription: 'Agent',
      files: { 'docs/guide.md': 'Hello' },
    };
    expect(
      createAgentSchema.safeParse({
        ...agent,
        translations: { en: translation },
      }).success,
    ).toBe(true);
    for (const path of [
      '../guide.md',
      '/guide.md',
      'docs\\guide.md',
      'run.sh',
    ]) {
      expect(
        createAgentSchema.safeParse({
          ...agent,
          translations: { en: { ...translation, files: { [path]: 'bad' } } },
        }).success,
      ).toBe(false);
    }
  });
});
