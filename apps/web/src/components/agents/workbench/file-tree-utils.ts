import type { FileTree, FileTreeNode } from '@agentrepo/trpc/schemas';

export interface FileEntry {
  path: string;
  name: string;
  content: string;
}

export function joinPath(parentPath: string, name: string): string {
  return parentPath ? `${parentPath}/${name}` : name;
}

export function flattenFiles(tree: FileTree, parentPath = ''): FileEntry[] {
  return tree.flatMap((node) => {
    const path = joinPath(parentPath, node.name);
    if (node.type === 'file') {
      return [{ path, name: node.name, content: node.content }];
    }
    return flattenFiles(node.children, path);
  });
}

/** Root README (any casing) if present, otherwise the first file depth-first. */
export function findInitialFilePath(tree: FileTree): string | null {
  const readme = tree.find(
    (node): node is FileTreeNode & { type: 'file' } =>
      node.type === 'file' && node.name.toLowerCase() === 'readme.md',
  );
  if (readme) {
    return readme.name;
  }
  return flattenFiles(tree)[0]?.path ?? null;
}

/** Ancestor directory paths of a file path: 'a/b/c.ts' → ['a', 'a/b']. */
export function parentDirsOf(path: string): string[] {
  const segments = path.split('/').slice(0, -1);
  return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
}

export function isMarkdownFile(name: string): boolean {
  return /\.(md|mdx|markdown)$/i.test(name);
}

/** Folders first; files grouped by extension, with natural ordering within a type. */
export function sortFileTree(tree: FileTree): FileTree {
  const compare = new Intl.Collator('en', {
    numeric: true,
    sensitivity: 'base',
  }).compare;
  const extension = (name: string) =>
    name.includes('.') ? (name.split('.').at(-1)?.toLowerCase() ?? '') : '';
  return tree
    .map((node) =>
      node.type === 'directory'
        ? { ...node, children: sortFileTree(node.children) }
        : node,
    )
    .sort((a, b) =>
      a.type !== b.type
        ? a.type === 'directory'
          ? -1
          : 1
        : a.type === 'file' && b.type === 'file'
          ? compare(extension(a.name), extension(b.name)) ||
            compare(a.name, b.name)
          : compare(a.name, b.name),
    );
}
