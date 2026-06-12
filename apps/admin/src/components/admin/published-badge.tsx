export function PublishedBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isPublished
          ? 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]'
          : 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]'
      }`}
    >
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}
