'use client';

import {
  createAgentSchema,
  fileTreeSchema,
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

type Agent = RouterOutputs['agents']['admin']['byId'];

const FILE_TREE_PLACEHOLDER = [
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
  const [slugTouched, setSlugTouched] = useState(Boolean(agent));
  const [values, setValues] = useState({
    title: agent?.title ?? '',
    slug: agent?.slug ?? '',
    shortDescription: agent?.shortDescription ?? '',
    version: agent?.version ?? '1.0.0',
    isPublished: agent?.isPublished ?? false,
    readmeContent: agent?.readmeContent ?? '',
  });
  const [fileTreeText, setFileTreeText] = useState(
    JSON.stringify(agent?.fileTree ?? FILE_TREE_PLACEHOLDER, null, 2)
  );

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

  const parseFileTree = (): unknown => {
    try {
      return JSON.parse(fileTreeText);
    } catch {
      setError('FileTree must be valid JSON');
      return undefined;
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const fileTreeJson = parseFileTree();
    if (fileTreeJson === undefined) {
      return;
    }

    const fileTree = fileTreeSchema.safeParse(fileTreeJson);
    if (!fileTree.success) {
      const issue = fileTree.error.issues[0];
      setError(`FileTree ${issue.path.join('.') || 'root'}: ${issue.message}`);
      return;
    }

    const parsed = createAgentSchema.safeParse({
      ...values,
      readmeContent: values.readmeContent.trim() ? values.readmeContent : null,
      fileTree: fileTree.data,
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
      <MonacoField
        label="FileTree (JSON)"
        language="json"
        value={fileTreeText}
        onChange={setFileTreeText}
        height="320px"
        hint='Array of nodes: { "name", "type": "file" | "directory", "content" | "children" }'
      />
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
