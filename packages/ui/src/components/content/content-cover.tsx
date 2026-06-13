import { cn } from '../../lib/utils';

export type ContentCoverKind = 'skill' | 'agent' | 'blog';

const KIND_STYLES: Record<
  ContentCoverKind,
  { background: string; accent: string; label: string }
> = {
  skill: {
    background:
      'bg-[linear-gradient(135deg,#7a2230_0%,#5b1822_60%,#3d1017_100%)]',
    accent: 'text-[#e8c2ca]',
    label: 'skill',
  },
  agent: {
    background:
      'bg-[linear-gradient(135deg,#2f5d8a_0%,#1f3e5c_60%,#142a3f_100%)]',
    accent: 'text-[#a8c4de]',
    label: 'agent',
  },
  blog: {
    background:
      'bg-[linear-gradient(135deg,#4a6b4a_0%,#33492f_60%,#212f1f_100%)]',
    accent: 'text-[#bcd3b4]',
    label: 'blog',
  },
};

export interface ContentCoverProps {
  title: string;
  kind: ContentCoverKind;
  imageUrl?: string | null;
  className?: string;
}

/**
 * Content header image. Renders the uploaded cover when present; otherwise
 * generates a per-kind HTML/CSS template using the title.
 */
export function ContentCover({ title, kind, imageUrl, className }: ContentCoverProps) {
  if (imageUrl) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  const style = KIND_STYLES[kind];
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex flex-col justify-between overflow-hidden p-4',
        style.background,
        className
      )}
    >
      {/* Dot grid texture */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:14px_14px]" />
      <span
        className={cn(
          'relative font-mono text-[10px] uppercase tracking-[0.2em]',
          style.accent
        )}
      >
        [{style.label}] · agentrepo.dev
      </span>
      <p className="relative line-clamp-2 font-mono text-lg font-semibold leading-snug text-white/95">
        {title}
      </p>
    </div>
  );
}
