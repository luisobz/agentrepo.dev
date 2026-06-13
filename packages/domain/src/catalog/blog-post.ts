export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  isPublished: boolean;
  headerImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
