'use client';

import { MousePointerClick } from 'lucide-react';
import { MarkdownContent } from '../../markdown/markdown-content';
import { isMarkdownFile } from './file-tree-utils';
import { useWorkbench } from './workbench-context';

export function FileViewer() {
  const { state, fileMap } = useWorkbench();
  const activeFile = state.activePath ? fileMap.get(state.activePath) : undefined;

  if (!activeFile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-[var(--color-text-muted)]">
        <MousePointerClick className="h-6 w-6" />
        <p className="text-sm">Select a file from the tree to view it.</p>
      </div>
    );
  }

  if (isMarkdownFile(activeFile.name)) {
    return (
      <div className="flex-1 overflow-auto p-6 sm:p-8">
        <MarkdownContent content={activeFile.content} className="prose-sm sm:prose-base" />
      </div>
    );
  }

  return (
    <pre className="flex-1 overflow-auto bg-[var(--color-console-bg)] p-5 font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)]">
      <code>{activeFile.content || '// (empty file)'}</code>
    </pre>
  );
}
