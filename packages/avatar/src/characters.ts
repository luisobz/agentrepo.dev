export const AVATAR_CHARACTERS = [
  'repo',
  'developer',
  'guardian',
  'researcher',
  'publisher',
] as const;
export type AvatarCharacterId = (typeof AVATAR_CHARACTERS)[number];
export function characterSheet(
  character: Exclude<AvatarCharacterId, 'repo'>,
  assetBase = '/avatars',
): string {
  return `${assetBase.replace(/\/$/, '')}/${character}.png`;
}
