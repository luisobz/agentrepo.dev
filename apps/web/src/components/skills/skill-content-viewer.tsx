'use client';

import { Button } from '@agentrepo/ui';
import { Check, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { MarkdownContent } from '../markdown/markdown-content';

type ViewerTab = 'rendered' | 'raw';

interface SkillContentViewerProps {
  content: string;
  downloadFileName: string;
}

function downloadAsMarkdown(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`rounded-t-md border-b-2 px-4 py-2 font-mono text-sm transition-colors ${
        isActive
          ? 'border-[var(--color-brand-garnet)] text-[var(--color-brand-garnet)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}

export function SkillContentViewer({
  content,
  downloadFileName,
}: SkillContentViewerProps) {
  const [tab, setTab] = useState<ViewerTab>('rendered');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <section className="rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] shadow-[var(--shadow-xs)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border-soft)] px-4 pt-2">
        <div role="tablist" className="flex">
          <TabButton isActive={tab === 'rendered'} onClick={() => setTab('rendered')}>
            Rendered
          </TabButton>
          <TabButton isActive={tab === 'raw'} onClick={() => setTab('raw')}>
            Raw
          </TabButton>
        </div>
        <div className="flex gap-2 pb-2">
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {isCopied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadAsMarkdown(content, downloadFileName)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download .md
          </Button>
        </div>
      </div>

      {tab === 'rendered' ? (
        <div className="p-6 sm:p-8">
          <MarkdownContent content={content} />
        </div>
      ) : (
        <pre className="overflow-x-auto rounded-b-[12px] bg-[var(--color-console-bg)] p-6 font-mono text-sm leading-relaxed text-[var(--color-text-primary)]">
          <code>{content}</code>
        </pre>
      )}
    </section>
  );
}
