import Link from 'next/link';
import {
  getPrivateSkillToken,
  privateSkillRequest,
} from '../../../lib/private-skills';
import { getServerLocale } from '../../../lib/i18n/server';
import { serverTrpc } from '../../../lib/trpc-server';
export default async function PrivateSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = await getPrivateSkillToken();
  const es = (await getServerLocale()) === 'es';
  const query = await searchParams;
  const page = /^\d{1,6}$/.test(query.page ?? '')
    ? Math.max(1, Number(query.page))
    : 1;
  const skills = await privateSkillRequest(() =>
    serverTrpc.privateSkills.list.mutate({ token, page, pageSize: 20 }),
  );
  return (
    <>
      <Link href="/skills" className="text-sm">
        {es ? '← Volver a Skills' : '← Back to Skills'}
      </Link>
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          {es ? 'Mis skills privadas' : 'My private skills'}
        </h1>
        <Link
          href="/skills/private/new"
          className="rounded-full bg-[var(--color-brand-garnet)] px-5 py-3 text-white"
        >
          {es ? 'Crear skill privada' : 'Create private skill'}
        </Link>
      </div>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        {es
          ? 'Solo tú puedes acceder. No se publican en el catálogo ni se distribuyen con el CLI.'
          : 'Only you can access these. They are excluded from the public catalogue and CLI.'}
      </p>
      {!skills.items.length && (
        <p>
          {es ? 'Todavía no tienes skills privadas.' : 'No private skills yet.'}
        </p>
      )}
      <div className="grid gap-4">
        {skills.items.map((skill) => (
          <Link
            key={skill.id}
            href={`/skills/private/${skill.id}`}
            className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-6"
          >
            <h2 className="text-xl font-semibold">{skill.title}</h2>
            {skill.description && <p className="mt-2">{skill.description}</p>}
            <span className="mt-4 block text-sm text-[var(--color-text-secondary)]">
              {es ? 'Privada · Revisión' : 'Private · Revision'}{' '}
              {skill.revision}
            </span>
          </Link>
        ))}
      </div>
      <nav
        className="mt-8 flex justify-between gap-4"
        aria-label={es ? 'Páginas de skills privadas' : 'Private skill pages'}
      >
        {page > 1 && (
          <Link href={`/skills/private?page=${page - 1}`}>
            {es ? '← Anterior' : '← Previous'}
          </Link>
        )}
        {page * 20 < skills.total && (
          <Link href={`/skills/private?page=${page + 1}`}>
            {es ? 'Siguiente →' : 'Next →'}
          </Link>
        )}
      </nav>
    </>
  );
}
