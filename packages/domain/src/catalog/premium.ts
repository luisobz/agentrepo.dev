import { Agent } from './agent';
import { Skill } from './skill';

/**
 * Public projection of a catalog asset: premium bodies are stripped until the
 * visitor purchases access. `isLocked` tells the UI to render the paywall.
 */
export type WithAccess<TModel> = TModel & { isLocked: boolean };

export function redactPremiumSkill<T extends Skill>(
  skill: T,
): WithAccess<Omit<T, 'translations'>> {
  const { translations: _translations, ...publicSkill } = skill;
  if (!skill.isPremium) {
    return { ...publicSkill, isLocked: false };
  }
  return { ...publicSkill, content: '', isLocked: true };
}

export function redactPremiumAgent<T extends Agent>(
  agent: T,
): WithAccess<Omit<T, 'translations'>> {
  const { translations: _translations, ...publicAgent } = agent;
  if (!agent.isPremium) {
    return { ...publicAgent, isLocked: false };
  }
  return { ...publicAgent, fileTree: [], readmeContent: null, isLocked: true };
}
