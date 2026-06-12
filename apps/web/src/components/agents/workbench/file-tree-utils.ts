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
      node.type === 'file' && node.name.toLowerCase() === 'readme.md'
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
