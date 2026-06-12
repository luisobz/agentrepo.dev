import type { FileTree } from '@agentrepo/trpc/schemas';
import { describe, expect, it } from 'vitest';
import { countFiles, hasPlayground } from './agents';

const baseTree: FileTree = [
  { name: 'README.md', type: 'file', content: '' },
  {
    name: 'src',
    type: 'directory',
    children: [{ name: 'index.ts', type: 'file', content: '' }],
  },
];

describe('hasPlayground', () => {
  it('detects a demo directory at any depth', () => {
    const tree: FileTree = [
      ...baseTree,
      {
        name: 'src2',
        type: 'directory',
        children: [{ name: 'demo', type: 'directory', children: [] }],
      },
    ];

    expect(hasPlayground(tree)).toBe(true);
  });

  it('detects playground files ignoring the extension and casing', () => {
    const tree: FileTree = [
      ...baseTree,
      { name: 'Playground.ts', type: 'file', content: '' },
    ];

    expect(hasPlayground(tree)).toBe(true);
  });

  it('returns false when no demo convention is present', () => {
    expect(hasPlayground(baseTree)).toBe(false);
  });
});

describe('countFiles', () => {
  it('counts files recursively', () => {
    expect(countFiles(baseTree)).toBe(2);
  });
});
