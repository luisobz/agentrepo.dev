import { describe, it, expect } from 'vitest';
import { Agent } from './agent';
import { Skill } from './skill';
import { redactPremiumSkill, redactPremiumAgent } from './premium';

const BASE_DATE = new Date('2024-01-01T00:00:00.000Z');

function buildSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 'skill-1',
    slug: 'my-skill',
    title: 'My Skill',
    description: 'A useful skill',
    content: 'SECRET PREMIUM BODY',
    type: 'prompt',
    version: '1.0.0',
    isPublished: true,
    headerImageUrl: null,
    isPremium: false,
    priceCents: null,
    currency: 'usd',
    previewContent: 'preview snippet',
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

function buildAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'agent-1',
    slug: 'my-agent',
    title: 'My Agent',
    shortDescription: 'An agent',
    version: '1.0.0',
    readmeContent: 'SECRET README',
    fileTree: [{ name: 'index.ts', type: 'file', content: 'SECRET CODE' }],
    isPublished: true,
    headerImageUrl: null,
    isPremium: false,
    priceCents: null,
    currency: 'usd',
    previewContent: 'preview snippet',
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

describe('redactPremiumSkill', () => {
  it('leaves a non-premium skill fully intact and marks it unlocked', () => {
    const skill = buildSkill({ isPremium: false });

    const result = redactPremiumSkill(skill);

    expect(result.isLocked).toBe(false);
    // Premium body is preserved for free content.
    expect(result.content).toBe('SECRET PREMIUM BODY');
    // Non-secret fields survive untouched.
    expect(result.id).toBe('skill-1');
    expect(result.slug).toBe('my-skill');
    expect(result.title).toBe('My Skill');
    expect(result.isPremium).toBe(false);
    expect(result.previewContent).toBe('preview snippet');
  });

  it('strips the content body of a premium skill and marks it locked', () => {
    const skill = buildSkill({ isPremium: true, content: 'SECRET PREMIUM BODY' });

    const result = redactPremiumSkill(skill);

    expect(result.isLocked).toBe(true);
    // Paid body MUST be emptied.
    expect(result.content).toBe('');
    // Everything non-secret survives so the paywall UI can render metadata.
    expect(result.id).toBe('skill-1');
    expect(result.slug).toBe('my-skill');
    expect(result.title).toBe('My Skill');
    expect(result.isPremium).toBe(true);
    expect(result.priceCents).toBe(skill.priceCents);
    expect(result.previewContent).toBe('preview snippet');
  });

  it('does not mutate the original skill object', () => {
    const skill = buildSkill({ isPremium: true, content: 'SECRET PREMIUM BODY' });

    redactPremiumSkill(skill);

    expect(skill.content).toBe('SECRET PREMIUM BODY');
  });
});

describe('redactPremiumAgent', () => {
  it('leaves a non-premium agent fully intact and marks it unlocked', () => {
    const agent = buildAgent({ isPremium: false });

    const result = redactPremiumAgent(agent);

    expect(result.isLocked).toBe(false);
    // Premium bodies preserved for free content.
    expect(result.fileTree).toEqual([
      { name: 'index.ts', type: 'file', content: 'SECRET CODE' },
    ]);
    expect(result.readmeContent).toBe('SECRET README');
    // Non-secret fields survive untouched.
    expect(result.id).toBe('agent-1');
    expect(result.slug).toBe('my-agent');
    expect(result.title).toBe('My Agent');
    expect(result.isPremium).toBe(false);
  });

  it('strips fileTree and readmeContent of a premium agent and marks it locked', () => {
    const agent = buildAgent({ isPremium: true });

    const result = redactPremiumAgent(agent);

    expect(result.isLocked).toBe(true);
    // Paid bodies MUST be emptied.
    expect(result.fileTree).toEqual([]);
    expect(result.readmeContent).toBeNull();
    // Everything non-secret survives.
    expect(result.id).toBe('agent-1');
    expect(result.slug).toBe('my-agent');
    expect(result.title).toBe('My Agent');
    expect(result.shortDescription).toBe('An agent');
    expect(result.isPremium).toBe(true);
    expect(result.priceCents).toBe(agent.priceCents);
    expect(result.previewContent).toBe('preview snippet');
  });

  it('does not mutate the original agent object', () => {
    const agent = buildAgent({ isPremium: true });

    redactPremiumAgent(agent);

    expect(agent.readmeContent).toBe('SECRET README');
    expect(agent.fileTree).toEqual([
      { name: 'index.ts', type: 'file', content: 'SECRET CODE' },
    ]);
  });
});
