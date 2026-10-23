import { getPrivateSkill } from '../../../../../lib/private-skills';
import { getServerLocale } from '../../../../../lib/i18n/server';
import { PrivateSkillForm } from '../../form';
export default async function EditPrivateSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const skill = await getPrivateSkill((await params).id);
  const es = (await getServerLocale()) === 'es';
  return (
    <>
      <h1 className="text-3xl font-semibold">
        {es ? 'Editar skill privada' : 'Edit private skill'}
      </h1>
      <PrivateSkillForm skill={skill} es={es} />
    </>
  );
}
