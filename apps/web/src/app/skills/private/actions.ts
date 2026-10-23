'use server';
import { TRPCClientError } from '@trpc/client';
import { redirect } from 'next/navigation';
import { getPrivateSkillToken } from '../../../lib/private-skills';
import { serverTrpc } from '../../../lib/trpc-server';
export type PrivateSkillFormState = {
  error: 'conflict' | 'invalid' | 'unavailable' | null;
};
export async function savePrivateSkill(
  _state: PrivateSkillFormState,
  form: FormData,
): Promise<PrivateSkillFormState> {
  const token = await getPrivateSkillToken();
  const value = (name: string) =>
    typeof form.get(name) === 'string' ? String(form.get(name)) : '';
  const data = {
    title: value('title'),
    slug: value('slug'),
    description: value('description') || null,
    content: value('content'),
  };
  let id: string;
  try {
    const existing = value('id');
    const skill = existing
      ? await serverTrpc.privateSkills.update.mutate({
          token,
          id: existing,
          revision: Number(value('revision')),
          data,
        })
      : await serverTrpc.privateSkills.create.mutate({ token, ...data });
    id = skill.id;
  } catch (error) {
    if (error instanceof TRPCClientError) {
      const code = error.data?.code;
      if (code === 'CONFLICT') return { error: 'conflict' };
      if (code === 'BAD_REQUEST') return { error: 'invalid' };
    }
    return { error: 'unavailable' };
  }
  redirect(`/skills/private/${id}`);
}
