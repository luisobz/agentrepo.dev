import type { AvatarCharacterId } from '@agentrepo/avatar';
export type ContentCast =
  | readonly [AvatarCharacterId]
  | readonly [AvatarCharacterId, AvatarCharacterId];
export function contentAvatarCast(
  kind: 'skill' | 'agent' | 'blog',
  slug = '',
): ContentCast {
  if (/sprites/.test(slug)) return ['developer', 'publisher'];
  if (/binance|eip-7702/.test(slug)) return ['researcher', 'guardian'];
  if (/nodejs|brotli|php|obliterated|server-status|linux-agent/.test(slug))
    return ['developer', 'guardian'];
  if (/hipotesis|research/.test(slug)) return ['researcher'];
  if (/writer|linkedin|telegram-design/.test(slug)) return ['publisher'];
  return kind === 'agent'
    ? ['developer', 'guardian']
    : kind === 'blog'
      ? ['researcher']
      : ['developer'];
}
