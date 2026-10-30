import type { BlogPost } from '../../lib/blog';

export function blogReadingSummary(
  post: Pick<BlogPost, 'lazyRead' | 'excerpt' | 'content'>,
) {
  if (post.lazyRead) return post.lazyRead;
  const paragraph = post.content
    .split(/\n\s*\n/)
    .find((part) => !/^\s*[#>`|-]/.test(part) && part.trim());
  const summary =
    post.excerpt?.trim() ||
    paragraph
      ?.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim() ||
    '';
  return {
    summary:
      summary.length > 600 ? summary.slice(0, 597).trimEnd() + '…' : summary,
    points: [],
  };
}
