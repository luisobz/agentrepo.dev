'use client';

import type { FileTree } from '@agentrepo/trpc/schemas';
import { Button } from '@agentrepo/ui';
import { Download } from 'lucide-react';
import { trpc } from '../utils/trpc';

interface AgentDownloadButtonProps {
  locale?: 'en' | 'es';
  contentLocale?: string;
  slug: string;
  version: string;
  fileTree: FileTree;
  readmeContent: string | null;
}

/** Exports the agent snapshot as JSON and counts it as a registry download. */
export function AgentDownloadButton({
  locale = 'en',
  contentLocale,
  slug,
  version,
  fileTree,
  readmeContent,
}: AgentDownloadButtonProps) {
  const recordDownload = trpc.agents.recordDownload.useMutation();

  const handleDownload = () => {
    const payload = JSON.stringify(
      {
        name: slug,
        version,
        ...(contentLocale ? { locale: contentLocale } : {}),
        readme: readmeContent,
        files: fileTree,
      },
      null,
      2,
    );
    const blob = new Blob([payload], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slug}-${version}${contentLocale ? `-${contentLocale}` : ''}.agent.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    // Fire-and-forget: stats must never get in the way of the download UX.
    recordDownload.mutate({ slug, version });
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleDownload}>
      <Download className="mr-1.5 h-3.5 w-3.5" />{' '}
      {locale === 'es' ? 'Descargar' : 'Download'} v{version}
    </Button>
  );
}
