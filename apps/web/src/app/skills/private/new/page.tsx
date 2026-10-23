import {
  getPrivateSkillToken,
  privateSkillRequest,
} from '../../../../lib/private-skills';
import { serverTrpc } from '../../../../lib/trpc-server';
import { getServerLocale } from '../../../../lib/i18n/server';
import { PrivateSkillForm } from '../form';
export default async function NewPrivateSkillPage() {
  const token = await getPrivateSkillToken();
  await privateSkillRequest(() =>
    serverTrpc.privateSkills.list.mutate({ token, page: 1, pageSize: 1 }),
  );
  const es = (await getServerLocale()) === 'es';
  return (
    <>
      <h1 className="text-3xl font-semibold">
        {es ? 'Crear skill privada' : 'Create private skill'}
      </h1>
      <PrivateSkillForm es={es} />
    </>
  );
}
