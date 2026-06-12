'use client';

import type { FileTree } from '@agentrepo/trpc/schemas';
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { FileEntry, flattenFiles } from './file-tree-utils';
import {
  createInitialWorkbenchState,
  workbenchReducer,
  WorkbenchState,
} from './workbench-state';

interface WorkbenchContextValue {
  state: WorkbenchState;
  fileMap: ReadonlyMap<string, FileEntry>;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  activate: (path: string) => void;
  toggleDir: (path: string) => void;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export function WorkbenchProvider({
  fileTree,
  children,
}: {
  fileTree: FileTree;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    workbenchReducer,
    fileTree,
    createInitialWorkbenchState
  );

  const value = useMemo<WorkbenchContextValue>(
    () => ({
      state,
      fileMap: new Map(flattenFiles(fileTree).map((file) => [file.path, file])),
      openFile: (path) => dispatch({ type: 'open-file', path }),
      closeTab: (path) => dispatch({ type: 'close-tab', path }),
      activate: (path) => dispatch({ type: 'activate', path }),
      toggleDir: (path) => dispatch({ type: 'toggle-dir', path }),
    }),
    [state, fileTree]
  );

  return (
    <WorkbenchContext.Provider value={value}>
      {children}
    </WorkbenchContext.Provider>
  );
}

export function useWorkbench(): WorkbenchContextValue {
  const context = useContext(WorkbenchContext);
  if (!context) {
    throw new Error('useWorkbench must be used inside a WorkbenchProvider');
  }
  return context;
}
