import { DataIntegrityError } from '../errors/domain.error';

export const SKILL_TYPES = ['prompt', 'system', 'config', 'template'] as const;

export type SkillType = (typeof SKILL_TYPES)[number];

export interface Skill {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  type: SkillType;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function isSkillType(value: unknown): value is SkillType {
  return (
    typeof value === 'string' && (SKILL_TYPES as readonly string[]).includes(value)
  );
}

export function assertSkillType(value: unknown): SkillType {
  if (!isSkillType(value)) {
    throw new DataIntegrityError(`unknown skill type "${String(value)}"`);
  }
  return value;
}
