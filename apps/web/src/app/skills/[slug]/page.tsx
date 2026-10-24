import { notFound, redirect } from 'next/navigation';
import { semverSchema, slugSchema } from '@agentrepo/trpc/schemas';
import { getPublishedSkillBySlug } from '../../../lib/skills';
import { skillVersionHref } from '../../../lib/skill-release';

export default async function SkillAliasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ version?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!slugSchema.safeParse(slug).success) notFound();
  const skill = await getPublishedSkillBySlug(slug);
  if (!skill) notFound();
  const version = query.version ?? skill.version;
  if (!semverSchema.safeParse(version).success) notFound();
  // Temporary: an unversioned bookmark intentionally follows the latest release.
  redirect(skillVersionHref(slug, version));
}
