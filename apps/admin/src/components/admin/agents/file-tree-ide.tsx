'use client';

import type { FileTree, FileTreeNode } from '@agentrepo/trpc/schemas';
import { Button } from '@agentrepo/ui';
import JSZip from 'jszip';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import {
  addNode,
  buildTreeFromEntries,
  findFile,
  removeNode,
  renameNode,
  setFileContent,
  type TreeEditResult,
} from '../../../lib/file-tree-edit';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
      Loading editor…
    </div>
  ),
});

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  md: 'markdown',
  css: 'css',
  html: 'html',
  yml: 'yaml',
  yaml: 'yaml',
  py: 'python',
  sh: 'shell',
};

function languageFor(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return LANGUAGE_BY_EXTENSION[extension] ?? 'plaintext';
}

interface ContextMenuState {
  x: number;
  y: number;
  path: string; // '' = root
  isDirectory: boolean;
}

interface FileTreeIDEProps {
  tree: FileTree;
  onChange: (tree: FileTree) => void;
  onError: (message: string) => void;
}

const joinPath = (parent: string, name: string) =>
  parent ? `${parent}/${name}` : name;

export function FileTreeIDE({ tree, onChange, onError }: FileTreeIDEProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const closeMenu = () => setMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const apply = (result: TreeEditResult) => {
    if (result.ok) {
      onChange(result.tree);
    } else {
      onError(result.error);
    }
    setMenu(null);
  };

  const targetDir = (state: ContextMenuState) =>
    state.isDirectory ? state.path : state.path.split('/').slice(0, -1).join('/');

  const handleNewFile = (state: ContextMenuState) => {
    const name = window.prompt('File name (e.g. index.ts)');
    if (!name) return;
    const dir = targetDir(state);
    apply(addNode(tree, dir, { name, type: 'file', content: '' }));
    setExpanded((prev) => new Set(prev).add(dir));
    setSelectedPath(joinPath(dir, name));
  };

  const handleNewFolder = (state: ContextMenuState) => {
    const name = window.prompt('Folder name');
    if (!name) return;
    const dir = targetDir(state);
    apply(addNode(tree, dir, { name, type: 'directory', children: [] }));
    setExpanded((prev) => new Set(prev).add(dir));
  };

  const handleRename = (state: ContextMenuState) => {
    const currentName = state.path.split('/').at(-1) ?? '';
    const name = window.prompt('New name', currentName);
    if (!name || name === currentName) return;
    apply(renameNode(tree, state.path, name));
    if (selectedPath === state.path) {
      setSelectedPath(
        [...state.path.split('/').slice(0, -1), name].join('/')
      );
    }
  };

  const handleDelete = (state: ContextMenuState) => {
    if (!window.confirm(`Delete "${state.path}"?`)) return;
    apply(removeNode(tree, state.path));
    if (selectedPath?.startsWith(state.path)) {
      setSelectedPath(null);
    }
  };

  const handleZipUpload = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const entries: { path: string; content: string }[] = [];
      let skipped = 0;
      for (const entry of Object.values(zip.files)) {
        if (entry.dir) continue;
        try {
          entries.push({
            path: entry.name,
            content: decoder.decode(await entry.async('uint8array')),
          });
        } catch {
          skipped += 1; // binary file — the FileTree only holds text
        }
      }
      if (entries.length === 0) {
        onError('The ZIP contains no readable text files');
        return;
      }
      onChange(buildTreeFromEntries(entries));
      setSelectedPath(null);
      setExpanded(new Set());
      if (skipped > 0) {
        onError(`Imported ${entries.length} files; skipped ${skipped} binary files`);
      }
    } catch {
      onError('Could not read the ZIP file');
    }
  };

  const selectedFile = selectedPath ? findFile(tree, selectedPath) : null;

  const renderNode = (node: FileTreeNode, parentPath: string, depth: number) => {
    const path = joinPath(parentPath, node.name);
    const indent = { paddingLeft: `${depth * 14 + 8}px` };
    const onContextMenu = (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        path,
        isDirectory: node.type === 'directory',
      });
    };

    if (node.type === 'file') {
      return (
        <li key={path}>
          <button
            type="button"
            onClick={() => setSelectedPath(path)}
            onContextMenu={onContextMenu}
            style={indent}
            className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left font-mono text-[13px] ${
              selectedPath === path
                ? 'bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{node.name}</span>
          </button>
        </li>
      );
    }

    const isExpanded = expanded.has(path);
    const Chevron = isExpanded ? ChevronDown : ChevronRight;
    const FolderIcon = isExpanded ? FolderOpen : Folder;
    return (
      <li key={path}>
        <button
          type="button"
          onClick={() =>
            setExpanded((prev) => {
              const next = new Set(prev);
              if (next.has(path)) {
                next.delete(path);
              } else {
                next.add(path);
              }
              return next;
            })
          }
          onContextMenu={onContextMenu}
          style={indent}
          className="flex w-full items-center gap-1 rounded px-2 py-1 text-left font-mono text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
        >
          <Chevron className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand-blue)]" />
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && (
          <ul>{node.children.map((child) => renderNode(child, path, depth + 1))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className="overflow-hidden rounded-md border border-[var(--color-border-soft)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-3 py-2">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Files — right-click for actions
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload ZIP
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleZipUpload(file);
            }
            event.target.value = '';
          }}
        />
      </div>

      <div className="flex h-[420px] flex-col md:flex-row">
        <div
          className="max-h-40 w-full overflow-auto border-b border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] py-1 md:max-h-none md:w-60 md:border-b-0 md:border-r"
          onContextMenu={(event) => {
            event.preventDefault();
            setMenu({ x: event.clientX, y: event.clientY, path: '', isDirectory: true });
          }}
        >
          <ul>{tree.map((node) => renderNode(node, '', 0))}</ul>
          {tree.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-[var(--color-text-muted)]">
              Right-click to create files, or upload a ZIP.
            </p>
          )}
        </div>

        <div className="min-h-[260px] min-w-0 flex-1 bg-white">
          {selectedFile && selectedPath ? (
            <MonacoEditor
              key={selectedPath}
              language={languageFor(selectedFile.name)}
              value={selectedFile.content}
              onChange={(next) => {
                const result = setFileContent(tree, selectedPath, next ?? '');
                if (result.ok) {
                  onChange(result.tree);
                }
              }}
              theme="vs"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
              Select a file to edit it.
            </div>
          )}
        </div>
      </div>

      {menu && (
        <div
          role="menu"
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-[200] w-44 overflow-hidden rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] py-1 text-sm shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <ContextMenuItem onClick={() => handleNewFile(menu)}>New file</ContextMenuItem>
          <ContextMenuItem onClick={() => handleNewFolder(menu)}>New folder</ContextMenuItem>
          {menu.path && (
            <>
              <ContextMenuItem onClick={() => handleRename(menu)}>Rename</ContextMenuItem>
              <ContextMenuItem destructive onClick={() => handleDelete(menu)}>
                Delete
              </ContextMenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ContextMenuItem({
  children,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full px-3 py-1.5 text-left transition-colors hover:bg-[var(--color-bg-surface)] ${
        destructive
          ? 'text-[var(--color-brand-garnet)]'
          : 'text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
