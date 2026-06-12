import type { FileTree } from '@agentrepo/trpc/schemas';
import { findInitialFilePath, parentDirsOf } from './file-tree-utils';

export interface WorkbenchState {
  openPaths: string[];
  activePath: string | null;
  expandedDirs: ReadonlySet<string>;
}

export type WorkbenchAction =
  | { type: 'open-file'; path: string }
  | { type: 'close-tab'; path: string }
  | { type: 'activate'; path: string }
  | { type: 'toggle-dir'; path: string };

export function createInitialWorkbenchState(tree: FileTree): WorkbenchState {
  const initialPath = findInitialFilePath(tree);
  return {
    openPaths: initialPath ? [initialPath] : [],
    activePath: initialPath,
    expandedDirs: new Set(initialPath ? parentDirsOf(initialPath) : []),
  };
}

export function workbenchReducer(
  state: WorkbenchState,
  action: WorkbenchAction
): WorkbenchState {
  switch (action.type) {
    case 'open-file': {
      const isOpen = state.openPaths.includes(action.path);
      return {
        ...state,
        openPaths: isOpen ? state.openPaths : [...state.openPaths, action.path],
        activePath: action.path,
      };
    }

    case 'activate': {
      if (!state.openPaths.includes(action.path)) {
        return state;
      }
      return { ...state, activePath: action.path };
    }

    case 'close-tab': {
      const index = state.openPaths.indexOf(action.path);
      if (index === -1) {
        return state;
      }
      const openPaths = state.openPaths.filter((path) => path !== action.path);
      const activePath =
        state.activePath === action.path
          ? openPaths[Math.min(index, openPaths.length - 1)] ?? null
          : state.activePath;
      return { ...state, openPaths, activePath };
    }

    case 'toggle-dir': {
      const expandedDirs = new Set(state.expandedDirs);
      if (expandedDirs.has(action.path)) {
        expandedDirs.delete(action.path);
      } else {
        expandedDirs.add(action.path);
      }
      return { ...state, expandedDirs };
    }
  }
}
