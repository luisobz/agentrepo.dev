import Link from 'next/link';
import { TypeChip } from '@agentrepo/ui';
import { LATEST_ITEMS, LatestItem } from '../../lib/latest-mock';
import { formatDate } from '../../lib/public-content';

function ItemBadge({ item }: { item: LatestItem }) {
  if (
    item.type === 'skill' &&
    (item.badge === 'prompt' ||
      item.badge === 'system' ||
      item.badge === 'config' ||
      item.badge === 'template')
  ) {
    return <TypeChip type={item.badge} />;
  }
  return (
    <span className="rounded-full border border-[var(--color-border-medium)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
      {item.type === 'agent' ? item.badge ?? 'agent' : item.type}
    </span>
  );
}

export function LatestSection() {
  return (
    <section aria-labelledby="latest-heading" className="pb-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 id="latest-heading" className="text-2xl font-semibold tracking-tight">
          Latest
        </h2>
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          fresh from the repo
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LATEST_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-6 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-[2px] hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between gap-3">
              <ItemBadge item={item} />
              <time
                dateTime={item.date}
                className="font-mono text-xs text-[var(--color-text-muted)]"
              >
                {formatDate(new Date(`${item.date}T00:00:00Z`))}
              </time>
            </div>
            <h3 className="mt-3 text-base font-semibold leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand-garnet)]">
              {item.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
