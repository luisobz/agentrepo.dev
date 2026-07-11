import Link from 'next/link';
import { formatDate } from '../../lib/public-content';

export interface VersionHistoryEntry {
  id: string;
  version: string;
  changelog: string | null;
  createdAt: Date;
  downloadsTotal: number;
  downloadsWeekly: number;
  isLatest: boolean;
}

interface VersionHistoryProps {
  versions: VersionHistoryEntry[];
  /** Detail page path, e.g. /skills/my-skill; versions link as ?version=x.y.z */
  basePath: string;
  currentVersion: string;
}

/** npm-style version history: every release with its downloads and tag. */
export function VersionHistory({
  versions,
  basePath,
  currentVersion,
}: VersionHistoryProps) {
  if (versions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="versions-heading" className="mt-12">
      <h2 id="versions-heading" className="text-xl font-semibold tracking-tight">
        Versions ({versions.length})
      </h2>
      <div className="mt-4 overflow-x-auto rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)]">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-soft)] font-mono text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Version</th>
              <th className="px-4 py-3 font-medium">Downloads (weekly)</th>
              <th className="px-4 py-3 font-medium">Downloads (total)</th>
              <th className="px-4 py-3 font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((entry) => {
              const isCurrent = entry.version === currentVersion;
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-[var(--color-border-soft)] last:border-0 ${
                    isCurrent ? 'bg-[var(--color-brand-garnet-ghost)]' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={
                          entry.isLatest
                            ? basePath
                            : `${basePath}?version=${entry.version}`
                        }
                        className="font-mono font-semibold text-[var(--color-brand-garnet)] hover:underline"
                      >
                        {entry.version}
                      </Link>
                      {entry.isLatest && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          latest
                        </span>
                      )}
                    </div>
                    {entry.changelog && (
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-[var(--color-text-secondary)]">
                        {entry.changelog}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {entry.downloadsWeekly.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {entry.downloadsTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">
                    {formatDate(entry.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
