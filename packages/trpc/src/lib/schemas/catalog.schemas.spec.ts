import { describe, expect, it } from 'vitest';
import {
  createSkillSchema,
  updateAgentSchema,
  updateBlogPostSchema,
  updateSkillSchema,
} from './catalog.schemas';

describe('create schemas', () => {
  it('fills defaults for omitted fields', () => {
    const parsed = createSkillSchema.parse({
      slug: 'a-skill',
      title: 'A skill',
      content: '# md',
      type: 'prompt',
    });

    expect(parsed.description).toBeNull();
    expect(parsed.isPublished).toBe(false);
  });
});

describe('update schemas', () => {
  // Regression: defaults reused in update schemas would reset omitted fields
  // (e.g. unpublishing a skill when only its title changes).
  it('does not inject defaults into partial skill patches', () => {
    const parsed = updateSkillSchema.parse({ title: 'Renamed' });

    expect(parsed).toEqual({ title: 'Renamed' });
  });

  it('does not inject defaults into partial agent patches', () => {
    const parsed = updateAgentSchema.parse({ shortDescription: 'New text' });

    expect(parsed).toEqual({ shortDescription: 'New text' });
  });

  it('does not inject defaults into partial blog post patches', () => {
    const parsed = updateBlogPostSchema.parse({ slug: 'new-slug' });

    expect(parsed).toEqual({ slug: 'new-slug' });
  });
});
