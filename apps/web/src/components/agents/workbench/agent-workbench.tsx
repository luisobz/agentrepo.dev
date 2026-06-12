'use client';

import type { FileTree } from '@agentrepo/trpc/schemas';
import { FileTabs } from './file-tabs';
import { FileTreePanel } from './file-tree-panel';
import { FileViewer } from './file-viewer';
import { WorkbenchProvider } from './workbench-context';

export interface AgentWorkbenchMeta {
  slug: string;
  version: string;
  updatedAt: string;
  fileCount: number;
  hasPlayground: boolean;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
      </dt>
      <dd className="font-mono text-sm text-[var(--color-text-primary)]">
        {value}
      </dd>
    </div>
  );
}

export function AgentWorkbench({
  fileTree,
  meta,
}: {
  fileTree: FileTree;
  meta: AgentWorkbenchMeta;
}) {
  return (
    <WorkbenchProvider fileTree={fileTree}>
      <div className="flex min-h-[480px] flex-col overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)] md:h-[70vh] md:flex-row">
        <aside className="max-h-56 shrink-0 overflow-auto border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/50 md:max-h-none md:w-60 md:border-b-0 md:border-r lg:w-64">
          <p className="px-4 pb-1 pt-3 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Files
          </p>
          <FileTreePanel tree={fileTree} />
        </aside>

        <div className="flex min-h-[320px] min-w-0 flex-1 flex-col">
          <FileTabs />
          <FileViewer />
        </div>

        <aside className="hidden w-56 shrink-0 border-l border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/50 p-4 xl:block">
          <p className="pb-3 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            About this agent
          </p>
          <dl className="flex flex-col gap-3">
            <MetaRow label="Version" value={`v${meta.version}`} />
            <MetaRow label="Slug" value={meta.slug} />
            <MetaRow label="Files" value={meta.fileCount} />
            <MetaRow label="Updated" value={meta.updatedAt} />
            <MetaRow
              label="Playground"
              value={meta.hasPlayground ? 'Included' : 'Not included'}
            />
          </dl>
        </aside>
      </div>
    </WorkbenchProvider>
  );
}
