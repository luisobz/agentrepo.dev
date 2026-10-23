/** Personal working document. Deliberately unrelated to public catalogue releases. */
export interface PrivateSkill {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PrivateSkillSummary = Omit<PrivateSkill, 'ownerId' | 'content'>;
export type PrivateSkillData = Pick<
  PrivateSkill,
  'slug' | 'title' | 'description' | 'content'
>;
