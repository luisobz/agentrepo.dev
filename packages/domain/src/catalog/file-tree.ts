export type FileTreeNode =
  | { name: string; type: 'file'; content: string }
  | { name: string; type: 'directory'; children: FileTreeNode[] };

export type FileTree = FileTreeNode[];

export function isFileTreeNode(value: unknown): value is FileTreeNode {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const node = value as Record<string, unknown>;
  if (typeof node['name'] !== 'string' || node['name'].length === 0) {
    return false;
  }

  if (node['type'] === 'file') {
    return typeof node['content'] === 'string';
  }

  if (node['type'] === 'directory') {
    return isFileTree(node['children']);
  }

  return false;
}

export function isFileTree(value: unknown): value is FileTree {
  return Array.isArray(value) && value.every(isFileTreeNode);
}
