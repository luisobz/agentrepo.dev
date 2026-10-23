'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { savePrivateSkill } from './actions';
type Document = {
  id: string;
  revision: number;
  title: string;
  slug: string;
  description: string | null;
  content: string;
};
export function PrivateSkillForm({
  skill,
  es,
}: {
  skill?: Document;
  es: boolean;
}) {
  const [state, action, pending] = useActionState(savePrivateSkill, {
    error: null,
  });
  const [fields, setFields] = useState({
    title: skill?.title ?? '',
    slug: skill?.slug ?? '',
    description: skill?.description ?? '',
    content: skill?.content ?? '',
  });
  const change = (key: keyof typeof fields, value: string) =>
    setFields((current) => ({ ...current, [key]: value }));
  const inputClass =
    'mt-2 w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-3';
  const errors = es
    ? {
        conflict:
          'La skill ha cambiado o el nombre ya existe. Revisa la versión guardada antes de volver a guardar.',
        invalid: 'Revisa el nombre, el título y el contenido.',
        unavailable:
          'No se ha podido guardar. Tu texto permanece aquí; vuelve a intentarlo.',
      }
    : {
        conflict:
          'The skill changed or this slug already exists. Review the saved version before saving again.',
        invalid: 'Check the slug, title and content.',
        unavailable:
          'Unable to save. Your text is still here; please try again.',
      };
  return (
    <form action={action} className="mt-8 grid gap-5">
      {skill && (
        <>
          <input type="hidden" name="id" value={skill.id} />
          <input type="hidden" name="revision" value={skill.revision} />
        </>
      )}
      <label>
        {es ? 'Título' : 'Title'}
        <input
          name="title"
          required
          maxLength={200}
          value={fields.title}
          onChange={(event) => change('title', event.target.value)}
          className={inputClass}
        />
      </label>
      <label>
        {es ? 'Identificador' : 'Slug'}
        <input
          name="slug"
          required
          maxLength={80}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={fields.slug}
          onChange={(event) => change('slug', event.target.value)}
          className={inputClass}
        />
      </label>
      <label>
        {es ? 'Descripción' : 'Description'}
        <textarea
          name="description"
          maxLength={500}
          value={fields.description}
          onChange={(event) => change('description', event.target.value)}
          className={inputClass}
        />
      </label>
      <label>
        {es ? 'Contenido Markdown' : 'Markdown content'}
        <textarea
          name="content"
          required
          maxLength={100000}
          rows={22}
          value={fields.content}
          onChange={(event) => change('content', event.target.value)}
          className={`${inputClass} font-mono text-sm`}
          spellCheck={false}
        />
      </label>
      {state.error && <p role="alert">{errors[state.error]}</p>}
      <div className="flex items-center gap-5">
        <button
          disabled={pending}
          className="rounded-full bg-[var(--color-brand-garnet)] px-6 py-3 text-white disabled:opacity-50"
        >
          {pending
            ? es
              ? 'Guardando…'
              : 'Saving…'
            : es
              ? 'Guardar en privado'
              : 'Save privately'}
        </button>
        <Link href={skill ? `/skills/private/${skill.id}` : '/skills/private'}>
          {es ? 'Cancelar' : 'Cancel'}
        </Link>
      </div>
    </form>
  );
}
