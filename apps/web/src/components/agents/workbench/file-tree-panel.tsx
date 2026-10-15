'use client';

import type { FileTree, FileTreeNode } from '@agentrepo/trpc/schemas';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FileCode2,
  FileJson,
  FileCog,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { useMemo } from 'react';
import { joinPath, sortFileTree } from './file-tree-utils';
import { useWorkbench } from './workbench-context';

function TreeNode({
  node,
  parentPath,
  depth,
}: {
  node: FileTreeNode;
  parentPath: string;
  depth: number;
}) {
  const { state, openFile, toggleDir } = useWorkbench();
  const path = joinPath(parentPath, node.name);
  const indent = { paddingLeft: `${depth * 14 + 8}px` };

  if (node.type === 'file') {
    const isActive = state.activePath === path;
    const extension = node.name.split('.').at(-1)?.toLowerCase();
    const FileIcon =
      extension === 'json'
        ? FileJson
        : [
              'py',
              'sh',
              'js',
              'mjs',
              'cjs',
              'ts',
              'tsx',
              'jsx',
              'html',
              'css',
              'sql',
            ].includes(extension ?? '')
          ? FileCode2
          : [
                'yaml',
                'yml',
                'toml',
                'ini',
                'conf',
                'cfg',
                'service',
                'timer',
              ].includes(extension ?? '')
            ? FileCog
            : FileText;
    return (
      <li>
        <button
          type="button"
          onClick={() => openFile(path)}
          style={indent}
          className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left font-mono text-[13px] transition-colors ${
            isActive
              ? 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <FileIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      </li>
    );
  }

  const isExpanded = state.expandedDirs.has(path);
  const FolderIcon = isExpanded ? FolderOpen : Folder;
  const Chevron = isExpanded ? ChevronDown : ChevronRight;

  return (
    <li>
      <button
        type="button"
        onClick={() => toggleDir(path)}
        aria-expanded={isExpanded}
        style={indent}
        className="flex w-full items-center gap-1 rounded px-2 py-1 text-left font-mono text-[13px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface)]"
      >
        <Chevron className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
        <FolderIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand-blue)]" />
        <span className="truncate">{node.name}</span>
      </button>
      {isExpanded && (
        <ul>
          {node.children.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              parentPath={path}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTreePanel({ tree }: { tree: FileTree }) {
  const sorted = useMemo(() => sortFileTree(tree), [tree]);
  return (
    <nav aria-label="Agent files" className="p-2">
      <ul>
        {sorted.map((node) => (
          <TreeNode key={node.name} node={node} parentPath="" depth={0} />
        ))}
      </ul>
    </nav>
  );
}
