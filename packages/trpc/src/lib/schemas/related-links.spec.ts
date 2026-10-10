import { expect, it } from 'vitest';
import { createSkillSchema, updateSkillSchema } from './catalog.schemas';
const skill = {
  slug: 'linked-skill',
  title: 'Linked skill',
  type: 'prompt',
  content: '# Content',
};
it('preserves labelled references and defaults old content to no links', () => {
  const relatedLinks = [
    { kind: 'github', label: 'Source', url: 'https://github.com/owner/repo' },
  ];
  expect(
    createSkillSchema.parse({ ...skill, relatedLinks }).relatedLinks,
  ).toEqual(relatedLinks);
  expect(createSkillSchema.parse(skill).relatedLinks).toEqual([]);
  expect(updateSkillSchema.parse({ title: 'Renamed' })).not.toHaveProperty(
    'relatedLinks',
  );
});
it.each([
  'javascript:alert(1)',
  'http://example.com',
  'https://user:pass@example.com',
  'https://127.0.0.1/test',
  'https://example.com/not-github',
])('rejects unsafe or misleading GitHub reference %s', (url) => {
  expect(
    createSkillSchema.safeParse({
      ...skill,
      relatedLinks: [{ kind: 'github', label: 'Source', url }],
    }).success,
  ).toBe(false);
});
it('rejects duplicate URLs and excessive reference lists', () => {
  const link = { kind: 'website', label: 'Site', url: 'https://example.com/' };
  expect(
    createSkillSchema.safeParse({ ...skill, relatedLinks: [link, link] })
      .success,
  ).toBe(false);
  expect(
    createSkillSchema.safeParse({
      ...skill,
      relatedLinks: Array.from({ length: 13 }, (_, i) => ({
        ...link,
        url: `https://example.com/${i}`,
      })),
    }).success,
  ).toBe(false);
});
