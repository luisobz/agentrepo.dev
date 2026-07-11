'use client';

import { Button, Input } from '@agentrepo/ui';
import { useMemo, useState } from 'react';
import { trpc } from '../../utils/trpc';

type AssetKind = 'skill' | 'agent';

interface VersionManagerProps {
  kind: AssetKind;
  assetId: string;
  /** Version string currently tagged latest (from the head row). */
  currentVersion: string;
}

function bumpSuggestions(version: string): string[] {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return [];
  }
  const [major, minor, patch] = parts;
  return [
    `${major}.${minor}.${patch + 1}`,
    `${major}.${minor + 1}.0`,
    `${major + 1}.0.0`,
  ];
}

/**
 * npm-style release panel for the edit pages: publish the current draft as a
 * new version, inspect the history with download stats and retag `latest`.
 */
export function VersionManager({ kind, assetId, currentVersion }: VersionManagerProps) {
  const utils = trpc.useUtils();
  const routers = { skill: trpc.skills.admin, agent: trpc.agents.admin };
  const routerUtils = { skill: utils.skills.admin, agent: utils.agents.admin };
  const admin = routers[kind];
  const adminUtils = routerUtils[kind];

  const suggestions = useMemo(
    () => bumpSuggestions(currentVersion),
    [currentVersion]
  );
  const [version, setVersion] = useState(suggestions[0] ?? '1.0.0');
  const [changelog, setChangelog] = useState('');

  const versions = admin.versions.useQuery({ id: assetId });

  const invalidate = async () => {
    await Promise.all([
      adminUtils.versions.invalidate({ id: assetId }),
      adminUtils.byId.invalidate({ id: assetId }),
    ]);
  };

  const publish = admin.publishVersion.useMutation({
    onSuccess: async (published) => {
      setChangelog('');
      const next = bumpSuggestions(published.version);
      setVersion(next[0] ?? '');
      await invalidate();
    },
  });

  const setLatest = admin.setLatestVersion.useMutation({
    onSettled: invalidate,
  });

  const handlePublish = () => {
    publish.mutate({
      id: assetId,
      version: version.trim(),
      changelog: changelog.trim() ? changelog.trim() : null,
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <header>
        <h2 className="text-lg font-semibold">Versions</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Publishing snapshots the saved content as an immutable release and
          tags it <code className="font-mono text-xs">latest</code>. Save your
          edits first.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium">
          New version
          <Input
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            placeholder="1.0.1"
            className="w-32 font-mono"
          />
        </label>
        <div className="flex gap-1 pb-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setVersion(suggestion)}
              className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand-garnet-muted)] hover:text-[var(--color-brand-garnet)]"
            >
              {['patch', 'minor', 'major'][index]} {suggestion}
            </button>
          ))}
        </div>
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs font-medium">
          Changelog (optional)
          <Input
            value={changelog}
            onChange={(event) => setChangelog(event.target.value)}
            placeholder="What changed in this release?"
          />
        </label>
        <Button
          onClick={handlePublish}
          disabled={publish.isPending || !/^\d+\.\d+\.\d+$/.test(version.trim())}
        >
          {publish.isPending ? 'Publishing…' : 'Publish version'}
        </Button>
      </div>
      {publish.error && (
        <p role="alert" className="text-sm text-red-600">
          {publish.error.message}
        </p>
      )}

      {versions.isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading versions…</p>
      ) : (versions.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No versions published yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-text-secondary)]">
                <th className="px-3 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">Weekly</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Published</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {versions.data?.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">
                        {entry.version}
                      </span>
                      {entry.isLatest && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-600">
                          latest
                        </span>
                      )}
                    </div>
                    {entry.changelog && (
                      <p className="mt-0.5 max-w-md text-xs text-[var(--color-text-secondary)]">
                        {entry.changelog}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {entry.downloadsWeekly.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {entry.downloadsTotal.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--color-text-secondary)]">
                    {entry.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {!entry.isLatest && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={setLatest.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Tag v${entry.version} as latest? The public page will serve this version.`
                            )
                          ) {
                            setLatest.mutate({
                              id: assetId,
                              versionId: entry.id,
                            });
                          }
                        }}
                      >
                        Set as latest
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
