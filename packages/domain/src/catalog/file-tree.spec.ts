import { describe, it, expect } from 'vitest';
import { isFileTreeNode, isFileTree } from './file-tree';

describe('isFileTreeNode', () => {
  it('accepts a valid file node', () => {
    expect(isFileTreeNode({ name: 'a.ts', type: 'file', content: 'x' })).toBe(true);
  });

  it('accepts a valid directory node with nested children', () => {
    expect(
      isFileTreeNode({
        name: 'src',
        type: 'directory',
        children: [{ name: 'a.ts', type: 'file', content: 'x' }],
      })
    ).toBe(true);
  });

  it('accepts an empty directory', () => {
    expect(isFileTreeNode({ name: 'src', type: 'directory', children: [] })).toBe(
      true
    );
  });

  it('rejects non-objects and null', () => {
    expect(isFileTreeNode(null)).toBe(false);
    expect(isFileTreeNode('a')).toBe(false);
    expect(isFileTreeNode(42)).toBe(false);
    expect(isFileTreeNode(undefined)).toBe(false);
  });

  it('rejects a node with a missing or empty name', () => {
    expect(isFileTreeNode({ type: 'file', content: 'x' })).toBe(false);
    expect(isFileTreeNode({ name: '', type: 'file', content: 'x' })).toBe(false);
  });

  it('rejects a file node without string content', () => {
    expect(isFileTreeNode({ name: 'a.ts', type: 'file' })).toBe(false);
    expect(isFileTreeNode({ name: 'a.ts', type: 'file', content: 1 })).toBe(false);
  });

  it('rejects a directory node with invalid children', () => {
    expect(
      isFileTreeNode({ name: 'src', type: 'directory', children: 'nope' })
    ).toBe(false);
    expect(
      isFileTreeNode({ name: 'src', type: 'directory', children: [{ bad: true }] })
    ).toBe(false);
  });

  it('rejects an unknown node type', () => {
    expect(isFileTreeNode({ name: 'a', type: 'symlink' })).toBe(false);
  });
});

describe('isFileTree', () => {
  it('accepts an empty array', () => {
    expect(isFileTree([])).toBe(true);
  });

  it('accepts an array of valid nodes', () => {
    expect(
      isFileTree([
        { name: 'a.ts', type: 'file', content: 'x' },
        { name: 'src', type: 'directory', children: [] },
      ])
    ).toBe(true);
  });

  it('rejects non-arrays', () => {
    expect(isFileTree(null)).toBe(false);
    expect(isFileTree({})).toBe(false);
  });

  it('rejects an array containing an invalid node', () => {
    expect(isFileTree([{ name: 'a.ts', type: 'file', content: 'x' }, { bad: 1 }])).toBe(
      false
    );
  });
});
