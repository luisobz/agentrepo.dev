import type { FileTree } from '@agentrepo/trpc/schemas';
import { describe, expect, it } from 'vitest';
import {
  createInitialWorkbenchState,
  workbenchReducer,
  WorkbenchState,
} from './workbench-state';

const tree: FileTree = [
  { name: 'README.md', type: 'file', content: '# Agent' },
  {
    name: 'src',
    type: 'directory',
    children: [
      { name: 'index.ts', type: 'file', content: 'export {}' },
      {
        name: 'skills',
        type: 'directory',
        children: [{ name: 'review.md', type: 'file', content: '## Review' }],
      },
    ],
  },
];

describe('createInitialWorkbenchState', () => {
  it('opens the root README by default', () => {
    const state = createInitialWorkbenchState(tree);

    expect(state.openPaths).toEqual(['README.md']);
    expect(state.activePath).toBe('README.md');
  });

  it('falls back to the first file and expands its ancestors', () => {
    const noReadme: FileTree = [tree[1]];
    const state = createInitialWorkbenchState(noReadme);

    expect(state.activePath).toBe('src/index.ts');
    expect(state.expandedDirs.has('src')).toBe(true);
  });

  it('handles an empty tree', () => {
    const state = createInitialWorkbenchState([]);

    expect(state.openPaths).toEqual([]);
    expect(state.activePath).toBeNull();
  });
});

describe('workbenchReducer', () => {
  const base: WorkbenchState = {
    openPaths: ['README.md'],
    activePath: 'README.md',
    expandedDirs: new Set(),
  };

  it('opens a new file in a new tab and activates it', () => {
    const state = workbenchReducer(base, {
      type: 'open-file',
      path: 'src/index.ts',
    });

    expect(state.openPaths).toEqual(['README.md', 'src/index.ts']);
    expect(state.activePath).toBe('src/index.ts');
  });

  it('re-activates an already open file without duplicating its tab', () => {
    const withTwo = workbenchReducer(base, {
      type: 'open-file',
      path: 'src/index.ts',
    });
    const state = workbenchReducer(withTwo, {
      type: 'open-file',
      path: 'README.md',
    });

    expect(state.openPaths).toEqual(['README.md', 'src/index.ts']);
    expect(state.activePath).toBe('README.md');
  });

  it('activates only tabs that are open', () => {
    expect(
      workbenchReducer(base, { type: 'activate', path: 'ghost.ts' })
    ).toBe(base);
  });

  it('closing the active tab activates its neighbour', () => {
    const withTwo = workbenchReducer(base, {
      type: 'open-file',
      path: 'src/index.ts',
    });
    const state = workbenchReducer(withTwo, {
      type: 'close-tab',
      path: 'src/index.ts',
    });

    expect(state.openPaths).toEqual(['README.md']);
    expect(state.activePath).toBe('README.md');
  });

  it('closing the last tab leaves no active file', () => {
    const state = workbenchReducer(base, {
      type: 'close-tab',
      path: 'README.md',
    });

    expect(state.openPaths).toEqual([]);
    expect(state.activePath).toBeNull();
  });

  it('closing an inactive tab keeps the active one', () => {
    const withTwo = workbenchReducer(base, {
      type: 'open-file',
      path: 'src/index.ts',
    });
    const state = workbenchReducer(withTwo, {
      type: 'close-tab',
      path: 'README.md',
    });

    expect(state.activePath).toBe('src/index.ts');
  });

  it('toggles directory expansion both ways', () => {
    const expanded = workbenchReducer(base, { type: 'toggle-dir', path: 'src' });
    expect(expanded.expandedDirs.has('src')).toBe(true);

    const collapsed = workbenchReducer(expanded, {
      type: 'toggle-dir',
      path: 'src',
    });
    expect(collapsed.expandedDirs.has('src')).toBe(false);
  });
});
