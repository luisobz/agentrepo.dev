import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

const PROSE_CLASSES =
  'prose max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-a:text-[var(--color-brand-garnet)] prose-a:underline-offset-4 hover:prose-a:text-[var(--color-brand-garnet-deep)] prose-strong:text-[var(--color-text-primary)] prose-blockquote:border-l-[var(--color-brand-garnet-muted)] prose-blockquote:text-[var(--color-text-secondary)] prose-code:rounded prose-code:bg-[var(--color-console-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[var(--color-console-bg)] prose-pre:text-[var(--color-text-primary)] prose-pre:border prose-pre:border-[var(--color-console-border)] prose-li:text-[var(--color-text-primary)] prose-th:text-[var(--color-text-primary)] prose-td:text-[var(--color-text-primary)] prose-hr:border-[var(--color-border-soft)]';

export interface MarkdownContentProps {
  content: string;
  className?: string;
}

/** GFM Markdown (tables, lists, links) themed with the design tokens. */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn(PROSE_CLASSES, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
