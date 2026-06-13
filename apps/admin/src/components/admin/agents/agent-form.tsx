'use client';

import {
  createAgentSchema,
  fileTreeSchema,
  type FileTree,
  type RouterOutputs,
} from '@agentrepo/trpc/schemas';
import { Button, Input } from '@agentrepo/ui';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { slugify } from '../../../lib/slugify';
import { trpc } from '../../utils/trpc';
import { FormError } from '../form/form-error';
import { FormField } from '../form/form-field';
import { MonacoField } from '../form/monaco-field';
import {
  PremiumFieldsSection,
  premiumPayloadFrom,
  premiumValuesFrom,
  type PremiumFormValues,
} from '../form/premium-fields';
import { FileTreeIDE } from './file-tree-ide';

type Agent = RouterOutputs['agents']['admin']['byId'];
type TreeEditorMode = 'ide' | 'json';

const FILE_TREE_PLACEHOLDER: FileTree = [
  {
    name: 'src',
    type: 'directory',
    children: [{ name: 'index.ts', type: 'file', content: '' }],
  },
];

export function AgentForm({ agent }: { agent?: Agent }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [treeNotice, setTreeNotice] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(agent));
  const [values, setValues] = useState({
    title: agent?.title ?? '',
    slug: agent?.slug ?? '',
    shortDescription: agent?.shortDescription ?? '',
    version: agent?.version ?? '1.0.0',
    isPublished: agent?.isPublished ?? false,
    readmeContent: agent?.readmeContent ?? '',
  });
  const [premium, setPremium] = useState<PremiumFormValues>(
    premiumValuesFrom(agent)
  );

  // The FileTree is the single source of truth; the JSON mode edits a text
  // snapshot that must parse + validate before going back to the IDE.
  const [fileTree, setFileTree] = useState<FileTree>(
    agent?.fileTree ?? FILE_TREE_PLACEHOLDER
  );
  const [treeMode, setTreeMode] = useState<TreeEditorMode>('ide');
  const [jsonDraft, setJsonDraft] = useState('');

  const switchTreeMode = (next: TreeEditorMode) => {
    setTreeNotice(null);
    if (next === treeMode) {
      return;
    }
    if (next === 'json') {
      setJsonDraft(JSON.stringify(fileTree, null, 2));
      setTreeMode('json');
      return;
    }
    const applied = applyJsonDraft();
    if (applied) {
      setTreeMode('ide');
    }
  };

  const applyJsonDraft = (): boolean => {
    try {
      const parsed = fileTreeSchema.safeParse(JSON.parse(jsonDraft));
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setTreeNotice(`FileTree ${issue.path.join('.') || 'root'}: ${issue.message}`);
        return false;
      }
      setFileTree(parsed.data);
      return true;
    } catch {
      setTreeNotice('FileTree must be valid JSON');
      return false;
    }
  };

  const finishSaving = async () => {
    await utils.agents.invalidate();
    router.push('/admin/agents');
  };
  const onError = (mutationError: { message: string }) =>
    setError(mutationError.message);
  const create = trpc.agents.admin.create.useMutation({
    onSuccess: finishSaving,
    onError,
  });
  const update = trpc.agents.admin.update.useMutation({
    onSuccess: finishSaving,
    onError,
  });
  const isSaving = create.isPending || update.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    let tree = fileTree;
    if (treeMode === 'json') {
      if (!applyJsonDraft()) {
        return;
      }
      try {
        tree = fileTreeSchema.parse(JSON.parse(jsonDraft));
      } catch {
        return;
      }
    }

    const parsed = createAgentSchema.safeParse({
      ...values,
      readmeContent: values.readmeContent.trim() ? values.readmeContent : null,
      fileTree: tree,
      ...premiumPayloadFrom(premium),
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(`${issue.path.join('.')}: ${issue.message}`);
      return;
    }

    if (agent) {
      update.mutate({ id: agent.id, data: parsed.data });
    } else {
      create.mutate(parsed.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Title" htmlFor="title">
          <Input
            id="title"
            value={values.title}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                title: event.target.value,
                slug: slugTouched ? prev.slug : slugify(event.target.value),
              }))
            }
            required
          />
        </FormField>
        <FormField label="Slug" htmlFor="slug" hint="Lowercase letters, numbers and hyphens">
          <Input
            id="slug"
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setValues((prev) => ({ ...prev, slug: event.target.value }));
            }}
            required
          />
        </FormField>
      </div>
      <FormField label="Short description" htmlFor="shortDescription">
        <Input
          id="shortDescription"
          value={values.shortDescription}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              shortDescription: event.target.value,
            }))
          }
          required
        />
      </FormField>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Version" htmlFor="version" hint="Semantic versioning, e.g. 1.0.0">
          <Input
            id="version"
            value={values.version}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, version: event.target.value }))
            }
            required
          />
        </FormField>
        <FormField label="Status" htmlFor="isPublished">
          <label className="flex items-center gap-2 py-[10px] text-sm text-[var(--color-text-secondary)]">
            <input
              id="isPublished"
              type="checkbox"
              checked={values.isPublished}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  isPublished: event.target.checked,
                }))
              }
              className="h-4 w-4 accent-[var(--color-brand-garnet)]"
            />
            Published
          </label>
        </FormField>
      </div>

      <PremiumFieldsSection
        values={premium}
        onChange={(patch) => setPremium((prev) => ({ ...prev, ...patch }))}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            FileTree
          </span>
          <div className="flex rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-0.5">
            {(['ide', 'json'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={treeMode === mode}
                onClick={() => switchTreeMode(mode)}
                className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
                  treeMode === mode
                    ? 'bg-[var(--color-bg-warm-white)] text-[var(--color-brand-garnet)] shadow-[var(--shadow-xs)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {mode === 'ide' ? 'Editor' : 'JSON'}
              </button>
            ))}
          </div>
        </div>

        {treeMode === 'ide' ? (
          <FileTreeIDE
            tree={fileTree}
            onChange={(next) => {
              setFileTree(next);
              setTreeNotice(null);
            }}
            onError={setTreeNotice}
          />
        ) : (
          <MonacoField
            label=""
            language="json"
            value={jsonDraft}
            onChange={setJsonDraft}
            height="320px"
            hint='Array of nodes: { "name", "type": "file" | "directory", "content" | "children" }'
          />
        )}
        <FormError message={treeNotice} />
      </div>

      <MonacoField
        label="README (Markdown, optional)"
        language="markdown"
        value={values.readmeContent}
        onChange={(readmeContent) =>
          setValues((prev) => ({ ...prev, readmeContent }))
        }
        height="320px"
      />
      <FormError message={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : agent ? 'Save changes' : 'Create agent'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/agents')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
