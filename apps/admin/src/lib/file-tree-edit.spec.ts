import type { FileTree } from '@agentrepo/trpc/schemas';
import { describe, expect, it } from 'vitest';
import {
  addNode,
  buildTreeFromEntries,
  findFile,
  removeNode,
  renameNode,
  setFileContent,
} from './file-tree-edit';

const tree: FileTree = [
  { name: 'README.md', type: 'file', content: 'docs' },
  {
    name: 'src',
    type: 'directory',
    children: [{ name: 'index.ts', type: 'file', content: 'a' }],
  },
];

describe('addNode', () => {
  it('adds a file inside a nested directory', () => {
    const result = addNode(tree, 'src', { name: 'b.ts', type: 'file', content: '' });

    expect(result.ok && findFile(result.tree, 'src/b.ts')).toBeTruthy();
  });

  it('rejects duplicated names in the same directory', () => {
    const result = addNode(tree, 'src', { name: 'index.ts', type: 'file', content: '' });

    expect(result).toEqual({ ok: false, error: '"index.ts" already exists here' });
  });

  it('rejects unknown parent directories', () => {
    expect(addNode(tree, 'ghost', { name: 'x', type: 'file', content: '' }).ok).toBe(false);
  });
});

describe('renameNode', () => {
  it('renames nested nodes immutably', () => {
    const result = renameNode(tree, 'src/index.ts', 'main.ts');

    expect(result.ok && findFile(result.tree, 'src/main.ts')?.content).toBe('a');
    expect(findFile(tree, 'src/index.ts')).not.toBeNull();
  });

  it('rejects renaming onto an existing sibling', () => {
    const withTwo = addNode(tree, 'src', { name: 'b.ts', type: 'file', content: '' });
    if (!withTwo.ok) throw new Error('setup');

    expect(renameNode(withTwo.tree, 'src/b.ts', 'index.ts').ok).toBe(false);
  });
});

describe('removeNode / setFileContent', () => {
  it('removes nodes by path', () => {
    const result = removeNode(tree, 'src/index.ts');

    expect(result.ok && findFile(result.tree, 'src/index.ts')).toBeNull();
  });

  it('updates file content by path', () => {
    const result = setFileContent(tree, 'src/index.ts', 'updated');

    expect(result.ok && findFile(result.tree, 'src/index.ts')?.content).toBe('updated');
  });

  it('fails to set content on directories', () => {
    expect(setFileContent(tree, 'src', 'x').ok).toBe(false);
  });
});

describe('buildTreeFromEntries', () => {
  it('builds nested directories from flat zip paths', () => {
    const built = buildTreeFromEntries([
      { path: 'README.md', content: 'r' },
      { path: 'src/deep/a.ts', content: 'a' },
      { path: 'src/b.ts', content: 'b' },
    ]);

    expect(findFile(built, 'src/deep/a.ts')?.content).toBe('a');
    expect(findFile(built, 'src/b.ts')?.content).toBe('b');
    expect(findFile(built, 'README.md')?.content).toBe('r');
  });
});
