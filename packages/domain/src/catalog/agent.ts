import { FileTree } from './file-tree';

export interface Agent {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  version: string;
  readmeContent: string | null;
  fileTree: FileTree;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
