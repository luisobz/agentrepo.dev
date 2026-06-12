'use client';

import { useParams } from 'next/navigation';
import { FormError } from '../../../../components/admin/form/form-error';
import { SkillForm } from '../../../../components/admin/skills/skill-form';
import { trpc } from '../../../../components/utils/trpc';

export default function EditSkillPage() {
  const { id } = useParams<{ id: string }>();
  const skill = trpc.skills.admin.byId.useQuery({ id });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit skill</h1>
      {skill.isLoading && (
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      )}
      {skill.error && <FormError message={skill.error.message} />}
      {skill.data && <SkillForm skill={skill.data} />}
    </div>
  );
}
