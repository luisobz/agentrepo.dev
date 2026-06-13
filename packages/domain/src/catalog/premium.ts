import { Agent } from './agent';
import { Skill } from './skill';

/**
 * Public projection of a catalog asset: premium bodies are stripped until the
 * visitor purchases access. `isLocked` tells the UI to render the paywall.
 */
export type WithAccess<TModel> = TModel & { isLocked: boolean };

export function redactPremiumSkill(skill: Skill): WithAccess<Skill> {
  if (!skill.isPremium) {
    return { ...skill, isLocked: false };
  }
  return { ...skill, content: '', isLocked: true };
}

export function redactPremiumAgent(agent: Agent): WithAccess<Agent> {
  if (!agent.isPremium) {
    return { ...agent, isLocked: false };
  }
  return { ...agent, fileTree: [], readmeContent: null, isLocked: true };
}
