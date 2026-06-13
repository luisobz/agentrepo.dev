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
  headerImageUrl: string | null;
  isPremium: boolean;
  priceCents: number | null;
  currency: string;
  previewContent: string | null;
  createdAt: Date;
  updatedAt: Date;
}
