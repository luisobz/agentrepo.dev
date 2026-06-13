import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentCover, TypeChip } from '@agentrepo/ui';
import { PremiumGate } from '../../../components/premium/premium-gate';
import { SkillContentViewer } from '../../../components/skills/skill-content-viewer';
import { formatDate } from '../../../lib/public-content';
import { getPublishedSkillBySlug } from '../../../lib/skills';

export const dynamic = 'force-dynamic';

interface SkillPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SkillPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getPublishedSkillBySlug(slug);
  if (!skill) {
    return { title: 'Skill not found | AgentRepo.dev' };
  }

  const description =
    skill.description ?? `${skill.title} — a reusable ${skill.type} skill.`;
  return {
    title: `${skill.title} | AgentRepo.dev Skills`,
    description,
    openGraph: {
      title: skill.title,
      description,
      type: 'article',
      url: `/skills/${skill.slug}`,
    },
  };
}

function countWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { slug } = await params;
  const skill = await getPublishedSkillBySlug(slug);
  if (!skill) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <Link
        href="/skills"
        className="font-mono text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand-garnet)]"
      >
        ← Back to skills
      </Link>

      <header className="mb-8 mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <TypeChip type={skill.type} />
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {skill.slug}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {skill.title}
        </h1>
        {skill.description && (
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-secondary)]">
            {skill.description}
          </p>
        )}
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-[var(--color-text-muted)]">
          <div className="flex gap-1.5">
            <dt>Updated:</dt>
            <dd>
              <time dateTime={skill.updatedAt.toISOString()}>
                {formatDate(skill.updatedAt)}
              </time>
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Words:</dt>
            <dd>{countWords(skill.content)}</dd>
          </div>
        </dl>
      </header>

      <ContentCover
        title={skill.title}
        kind="skill"
        imageUrl={skill.headerImageUrl}
        className="mb-8 h-44 w-full rounded-[12px] sm:h-56"
      />

      {skill.isLocked ? (
        <PremiumGate
          priceCents={skill.priceCents}
          currency={skill.currency}
          previewContent={skill.previewContent}
        />
      ) : (
        <SkillContentViewer
          content={skill.content}
          downloadFileName={`${skill.slug}.md`}
        />
      )}
    </div>
  );
}
