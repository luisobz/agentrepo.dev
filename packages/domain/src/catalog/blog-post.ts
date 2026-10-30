import { localizeContent, type ContentLocale } from './content-locale';
import type { ReadingSummary } from './reading-summary';
import type { LocalizedContent } from './content-locale';
import type { RelatedLink } from './related-link';
export interface BlogPost extends LocalizedContent {
  lazyRead?: ReadingSummary | null;
  authorId?: string | null;
  authorName?: string | null;
  relatedLinks?: RelatedLink[];
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

export function localizeBlogPost<
  T extends LocalizedContent & {
    lazyRead?: ReadingSummary | null;
    content: string;
  },
>(post: T, locale?: ContentLocale) {
  const localized = localizeContent(post, locale);
  const lazyRead =
    localized.contentLocale === (post.sourceLocale ?? 'en')
      ? post.lazyRead
      : post.translations?.[localized.contentLocale]?.lazyRead;
  return { ...localized, lazyRead: lazyRead ?? null };
}
