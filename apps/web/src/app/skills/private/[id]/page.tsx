import Link from 'next/link';
import { getPrivateSkill } from '../../../../lib/private-skills';
import { getServerLocale } from '../../../../lib/i18n/server';
import { SkillContentViewer } from '../../../../components/skills/skill-content-viewer';
export default async function PrivateSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const skill = await getPrivateSkill((await params).id);
  const locale = await getServerLocale();
  const es = locale === 'es';
  return (
    <>
      <Link href="/skills/private">
        {es ? '← Mis skills privadas' : '← My private skills'}
      </Link>
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">{skill.title}</h1>
        <Link href={`/skills/private/${skill.id}/edit`} className="underline">
          {es ? 'Editar' : 'Edit'}
        </Link>
      </div>
      <p className="mb-4 text-sm">
        {es
          ? 'Privada · Solo para ti · Revisión'
          : 'Private · Only you · Revision'}{' '}
        {skill.revision}
      </p>
      {skill.description && <p className="mb-8">{skill.description}</p>}
      <SkillContentViewer
        content={skill.content}
        locale={locale}
        downloadFileName={`${skill.slug}.md`}
      />
    </>
  );
}
