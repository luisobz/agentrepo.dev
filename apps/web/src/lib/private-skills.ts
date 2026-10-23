import {
  getPrivateAdminToken,
  privateAdminRequest,
} from './private-admin-access';
import { serverTrpc } from './trpc-server';

// The token is read only on the server; each backend operation verifies identity and role.
export const getPrivateSkillToken = getPrivateAdminToken;
export const privateSkillRequest = privateAdminRequest;
export async function getPrivateSkill(id: string) {
  const token = await getPrivateSkillToken();
  return privateSkillRequest(() =>
    serverTrpc.privateSkills.byId.mutate({ token, id }),
  );
}
