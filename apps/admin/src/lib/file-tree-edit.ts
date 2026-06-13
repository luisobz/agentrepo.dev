import type { FileTree, FileTreeNode } from '@agentrepo/trpc/schemas';

export type TreeEditResult =
  | { ok: true; tree: FileTree }
  | { ok: false; error: string };

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function editChildren(
  tree: FileTree,
  parentSegments: string[],
  edit: (children: FileTree) => FileTree | string
): FileTree | string {
  if (parentSegments.length === 0) {
    return edit(tree);
  }
  const [head, ...rest] = parentSegments;
  let found = false;
  const next: FileTree = [];
  for (const node of tree) {
    if (node.name === head && node.type === 'directory') {
      found = true;
      const edited = editChildren(node.children, rest, edit);
      if (typeof edited === 'string') {
        return edited;
      }
      next.push({ ...node, children: edited });
    } else {
      next.push(node);
    }
  }
  return found ? next : `Directory not found: ${head}`;
}

function run(
  tree: FileTree,
  parentPath: string,
  edit: (children: FileTree) => FileTree | string
): TreeEditResult {
  const result = editChildren(tree, splitPath(parentPath), edit);
  return typeof result === 'string'
    ? { ok: false, error: result }
    : { ok: true, tree: result };
}

/** Adds a node inside `parentPath` ('' = root). Fails on name collisions. */
export function addNode(
  tree: FileTree,
  parentPath: string,
  node: FileTreeNode
): TreeEditResult {
  return run(tree, parentPath, (children) =>
    children.some((sibling) => sibling.name === node.name)
      ? `"${node.name}" already exists here`
      : [...children, node]
  );
}

export function renameNode(
  tree: FileTree,
  path: string,
  newName: string
): TreeEditResult {
  const segments = splitPath(path);
  const name = segments.at(-1) ?? '';
  return run(tree, segments.slice(0, -1).join('/'), (children) => {
    if (!children.some((node) => node.name === name)) {
      return `Not found: ${path}`;
    }
    if (children.some((node) => node.name === newName && node.name !== name)) {
      return `"${newName}" already exists here`;
    }
    return children.map((node) =>
      node.name === name ? { ...node, name: newName } : node
    );
  });
}

export function removeNode(tree: FileTree, path: string): TreeEditResult {
  const segments = splitPath(path);
  const name = segments.at(-1) ?? '';
  return run(tree, segments.slice(0, -1).join('/'), (children) =>
    children.some((node) => node.name === name)
      ? children.filter((node) => node.name !== name)
      : `Not found: ${path}`
  );
}

export function setFileContent(
  tree: FileTree,
  path: string,
  content: string
): TreeEditResult {
  const segments = splitPath(path);
  const name = segments.at(-1) ?? '';
  return run(tree, segments.slice(0, -1).join('/'), (children) => {
    const target = children.find((node) => node.name === name);
    if (!target || target.type !== 'file') {
      return `File not found: ${path}`;
    }
    return children.map((node) =>
      node.name === name && node.type === 'file' ? { ...node, content } : node
    );
  });
}

export function findFile(
  tree: FileTree,
  path: string
): (FileTreeNode & { type: 'file' }) | null {
  const segments = splitPath(path);
  let current: FileTree = tree;
  for (let i = 0; i < segments.length; i++) {
    const node = current.find((candidate) => candidate.name === segments[i]);
    if (!node) {
      return null;
    }
    if (i === segments.length - 1) {
      return node.type === 'file' ? node : null;
    }
    if (node.type !== 'directory') {
      return null;
    }
    current = node.children;
  }
  return null;
}

/** Builds a FileTree from flat zip entries (path → text content). */
export function buildTreeFromEntries(
  entries: { path: string; content: string }[]
): FileTree {
  const root: FileTree = [];
  for (const entry of entries) {
    const segments = splitPath(entry.path);
    if (segments.length === 0) {
      continue;
    }
    let current = root;
    for (let i = 0; i < segments.length - 1; i++) {
      let dir = current.find(
        (node): node is FileTreeNode & { type: 'directory' } =>
          node.name === segments[i] && node.type === 'directory'
      );
      if (!dir) {
        dir = { name: segments[i], type: 'directory', children: [] };
        current.push(dir);
      }
      current = dir.children;
    }
    const fileName = segments.at(-1) as string;
    if (!current.some((node) => node.name === fileName)) {
      current.push({ name: fileName, type: 'file', content: entry.content });
    }
  }
  return root;
}
