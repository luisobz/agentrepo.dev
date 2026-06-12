'use client';

import {
  createSkillSchema,
  SKILL_TYPES,
  skillTypeSchema,
  type RouterOutputs,
} from '@agentrepo/trpc/schemas';
import { Button, Input } from '@agentrepo/ui';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { slugify } from '../../../lib/slugify';
import { trpc } from '../../utils/trpc';
import { FormError } from '../form/form-error';
import { FormField } from '../form/form-field';
import { MonacoField } from '../form/monaco-field';

type Skill = RouterOutputs['skills']['admin']['byId'];

export function SkillForm({ skill }: { skill?: Skill }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(skill));
  const [values, setValues] = useState({
    title: skill?.title ?? '',
    slug: skill?.slug ?? '',
    description: skill?.description ?? '',
    type: skill?.type ?? 'prompt',
    isPublished: skill?.isPublished ?? false,
    content: skill?.content ?? '',
  });

  const finishSaving = async () => {
    await utils.skills.invalidate();
    router.push('/admin/skills');
  };
  const onError = (mutationError: { message: string }) =>
    setError(mutationError.message);
  const create = trpc.skills.admin.create.useMutation({
    onSuccess: finishSaving,
    onError,
  });
  const update = trpc.skills.admin.update.useMutation({
    onSuccess: finishSaving,
    onError,
  });
  const isSaving = create.isPending || update.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = createSkillSchema.safeParse({
      ...values,
      description: values.description.trim() ? values.description.trim() : null,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(`${issue.path.join('.')}: ${issue.message}`);
      return;
    }

    if (skill) {
      update.mutate({ id: skill.id, data: parsed.data });
    } else {
      create.mutate(parsed.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Title" htmlFor="title">
          <Input
            id="title"
            value={values.title}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                title: event.target.value,
                slug: slugTouched ? prev.slug : slugify(event.target.value),
              }))
            }
            required
          />
        </FormField>
        <FormField label="Slug" htmlFor="slug" hint="Lowercase letters, numbers and hyphens">
          <Input
            id="slug"
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setValues((prev) => ({ ...prev, slug: event.target.value }));
            }}
            required
          />
        </FormField>
      </div>
      <FormField label="Description" htmlFor="description">
        <Input
          id="description"
          value={values.description}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, description: event.target.value }))
          }
        />
      </FormField>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Type" htmlFor="type">
          <select
            id="type"
            value={values.type}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                type: skillTypeSchema.parse(event.target.value),
              }))
            }
            className="flex w-full rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] px-[14px] py-[10px] text-[15px] text-[var(--color-text-primary)] focus-visible:border-[var(--color-brand-garnet)] focus-visible:outline-none"
          >
            {SKILL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status" htmlFor="isPublished">
          <label className="flex items-center gap-2 py-[10px] text-sm text-[var(--color-text-secondary)]">
            <input
              id="isPublished"
              type="checkbox"
              checked={values.isPublished}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  isPublished: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-[var(--color-brand-garnet)]"
            />
            Published
          </label>
        </FormField>
      </div>
      <MonacoField
        label="Content (Markdown)"
        language="markdown"
        value={values.content}
        onChange={(content) => setValues((prev) => ({ ...prev, content }))}
      />
      <FormError message={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : skill ? 'Save changes' : 'Create skill'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/skills')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
