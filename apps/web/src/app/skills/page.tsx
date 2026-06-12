import Link from 'next/link';
import type { Metadata } from 'next';
import { TypeChip } from '@agentrepo/ui';
import { formatDate } from '../../lib/public-content';
import { getPublishedSkills } from '../../lib/skills';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Skills | AgentRepo.dev',
  description:
    'Reusable prompts, system instructions, configs and templates for AI agents.',
};

export default async function SkillsPage() {
  const skills = await getPublishedSkills();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Skills
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Reusable prompts, system instructions, configs and templates — ready
          to copy into your own agents.
        </p>
      </header>

      {skills.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">
          Nothing published yet. Come back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.slug}`}
              className="group flex flex-col rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-6 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-[2px] hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-sm)]"
            >
              <TypeChip type={skill.type} className="self-start" />
              <h2 className="mt-3 text-lg font-semibold leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand-garnet)]">
                {skill.title}
              </h2>
              {skill.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {skill.description}
                </p>
              )}
              <time
                dateTime={skill.updatedAt.toISOString()}
                className="mt-auto pt-4 font-mono text-xs text-[var(--color-text-muted)]"
              >
                Updated {formatDate(skill.updatedAt)}
              </time>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
