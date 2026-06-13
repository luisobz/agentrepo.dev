'use client';

import { ContentCover, MarkdownContent, TypeChip } from '@agentrepo/ui';
import type { SkillType } from '@agentrepo/trpc/schemas';

const CARD_CLASSES =
  'overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)]';

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--color-border-medium)] bg-[var(--color-bg-base)] p-6">
      {children}
    </div>
  );
}

/** How the post card looks in the public /blog listing. */
export function BlogSummaryPreview({
  title,
  excerpt,
  headerImageUrl,
}: {
  title: string;
  excerpt: string;
  headerImageUrl: string;
}) {
  return (
    <PreviewFrame>
      <div className={`mx-auto max-w-xl ${CARD_CLASSES}`}>
        {headerImageUrl && (
          <ContentCover title={title} kind="blog" imageUrl={headerImageUrl} className="h-36 w-full" />
        )}
        <article className="p-6">
          <time className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {new Date().toLocaleDateString()}
          </time>
          <h2 className="mt-2 text-xl font-semibold leading-snug">{title || 'Untitled post'}</h2>
          {excerpt && (
            <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">{excerpt}</p>
          )}
          <span className="mt-4 inline-block text-sm font-medium text-[var(--color-brand-garnet)]">
            Read post →
          </span>
        </article>
      </div>
    </PreviewFrame>
  );
}

/** How the full post page looks at /blog/[slug]. */
export function BlogDetailPreview({
  title,
  excerpt,
  content,
  headerImageUrl,
}: {
  title: string;
  excerpt: string;
  content: string;
  headerImageUrl: string;
}) {
  return (
    <PreviewFrame>
      <article className="mx-auto max-w-2xl">
        <time className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {new Date().toLocaleDateString()}
        </time>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
          {title || 'Untitled post'}
        </h1>
        {excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">{excerpt}</p>
        )}
        {headerImageUrl && (
          <ContentCover title={title} kind="blog" imageUrl={headerImageUrl} className="mt-8 h-48 w-full rounded-[12px]" />
        )}
        <div className="mt-8">
          <MarkdownContent content={content || '_No content yet…_'} />
        </div>
      </article>
    </PreviewFrame>
  );
}

/** How the skill card looks in the public /skills grid. */
export function SkillSummaryPreview({
  title,
  description,
  type,
  headerImageUrl,
  premiumLabel,
}: {
  title: string;
  description: string;
  type: SkillType;
  headerImageUrl: string;
  premiumLabel: string | null;
}) {
  return (
    <PreviewFrame>
      <div className={`mx-auto max-w-sm ${CARD_CLASSES}`}>
        <ContentCover title={title || 'Untitled skill'} kind="skill" imageUrl={headerImageUrl || null} className="h-28 w-full" />
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between gap-2">
            <TypeChip type={type} />
            {premiumLabel && (
              <span className="rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
                {premiumLabel}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-snug">{title || 'Untitled skill'}</h2>
          {description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>
      </div>
    </PreviewFrame>
  );
}

/** How the full skill page looks at /skills/[slug]. */
export function SkillDetailPreview({
  title,
  description,
  type,
  content,
  headerImageUrl,
  premiumLabel,
  previewContent,
}: {
  title: string;
  description: string;
  type: SkillType;
  content: string;
  headerImageUrl: string;
  premiumLabel: string | null;
  previewContent: string;
}) {
  return (
    <PreviewFrame>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <TypeChip type={type} />
          {premiumLabel && (
            <span className="rounded-full bg-[var(--color-brand-garnet-ghost)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-garnet)]">
              {premiumLabel}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
          {title || 'Untitled skill'}
        </h1>
        {description && (
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
        )}
        <ContentCover title={title || 'Untitled skill'} kind="skill" imageUrl={headerImageUrl || null} className="mt-6 h-44 w-full rounded-[12px]" />
        <div className={`mt-6 ${CARD_CLASSES} p-6`}>
          {premiumLabel ? (
            <>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Public preview (locked asset)
              </p>
              <MarkdownContent content={previewContent || '_No public preview yet…_'} />
            </>
          ) : (
            <MarkdownContent content={content || '_No content yet…_'} />
          )}
        </div>
      </div>
    </PreviewFrame>
  );
}
