import type { FileTree } from '@agentrepo/trpc/schemas';
import { describe, expect, it } from 'vitest';
import {
  findInitialFilePath,
  flattenFiles,
  isMarkdownFile,
  parentDirsOf,
  sortFileTree,
} from './file-tree-utils';

const tree: FileTree = [
  {
    name: 'src',
    type: 'directory',
    children: [
      { name: 'a.ts', type: 'file', content: 'a' },
      {
        name: 'deep',
        type: 'directory',
        children: [{ name: 'b.md', type: 'file', content: 'b' }],
      },
    ],
  },
  { name: 'readme.MD', type: 'file', content: 'root' },
];

describe('flattenFiles', () => {
  it('returns every file with its full path', () => {
    expect(flattenFiles(tree).map((file) => file.path)).toEqual([
      'src/a.ts',
      'src/deep/b.md',
      'readme.MD',
    ]);
  });
});

describe('findInitialFilePath', () => {
  it('prefers the root README regardless of casing', () => {
    expect(findInitialFilePath(tree)).toBe('readme.MD');
  });

  it('falls back to the first file depth-first', () => {
    expect(findInitialFilePath([tree[0]])).toBe('src/a.ts');
  });

  it('returns null for trees without files', () => {
    expect(
      findInitialFilePath([{ name: 'empty', type: 'directory', children: [] }]),
    ).toBeNull();
  });
});

describe('parentDirsOf', () => {
  it('lists every ancestor directory', () => {
    expect(parentDirsOf('a/b/c.ts')).toEqual(['a', 'a/b']);
  });

  it('returns nothing for root files', () => {
    expect(parentDirsOf('c.ts')).toEqual([]);
  });
});

describe('isMarkdownFile', () => {
  it('matches markdown extensions case-insensitively', () => {
    expect(isMarkdownFile('README.md')).toBe(true);
    expect(isMarkdownFile('notes.MDX')).toBe(true);
    expect(isMarkdownFile('index.ts')).toBe(false);
  });
});

describe('sortFileTree', () => {
  it('sorts folders first, then groups files by extension and natural name without mutation', () => {
    const input: FileTree = [
      { name: 'z.py', type: 'file', content: '' },
      { name: 'README.md', type: 'file', content: '' },
      {
        name: 'b',
        type: 'directory',
        children: [
          { name: 'z.md', type: 'file', content: '' },
          { name: 'a', type: 'directory', children: [] },
        ],
      },
      { name: 'file10.py', type: 'file', content: '' },
      { name: 'file2.py', type: 'file', content: '' },
      { name: 'a', type: 'directory', children: [] },
    ];
    const sorted = sortFileTree(input);
    expect(sorted.map((node) => node.name)).toEqual([
      'a',
      'b',
      'README.md',
      'file2.py',
      'file10.py',
      'z.py',
    ]);
    expect(sorted[1].type === 'directory' && sorted[1].children[0].name).toBe(
      'a',
    );
    expect(input[0].name).toBe('z.py');
  });
});
