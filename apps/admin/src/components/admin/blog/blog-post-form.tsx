'use client';

import {
  createBlogPostSchema,
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
  BlogDetailPreview,
  BlogSummaryPreview,
} from '../preview/content-previews';
import { ViewSwitch, type FormView } from '../preview/view-switch';

type BlogPost = RouterOutputs['blogPosts']['admin']['byId'];

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<FormView>('edit');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [values, setValues] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    headerImageUrl: post?.headerImageUrl ?? '',
    isPublished: post?.isPublished ?? false,
    content: post?.content ?? '',
  });

  const finishSaving = async () => {
    await utils.blogPosts.invalidate();
    router.push('/admin/blog');
  };
  const onError = (mutationError: { message: string }) =>
    setError(mutationError.message);
  const create = trpc.blogPosts.admin.create.useMutation({
    onSuccess: finishSaving,
    onError,
  });
  const update = trpc.blogPosts.admin.update.useMutation({
    onSuccess: finishSaving,
    onError,
  });
  const isSaving = create.isPending || update.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = createBlogPostSchema.safeParse({
      ...values,
      excerpt: values.excerpt.trim() ? values.excerpt.trim() : null,
      headerImageUrl: values.headerImageUrl.trim() || null,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(`${issue.path.join('.')}: ${issue.message}`);
      return;
    }

    if (post) {
      update.mutate({ id: post.id, data: parsed.data });
    } else {
      create.mutate(parsed.data);
    }
  };

  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <ViewSwitch view={view} onChange={setView} />

      {view === 'summary' && (
        <BlogSummaryPreview
          title={values.title}
          excerpt={values.excerpt}
          headerImageUrl={values.headerImageUrl}
        />
      )}
      {view === 'page' && (
        <BlogDetailPreview
          title={values.title}
          excerpt={values.excerpt}
          content={values.content}
          headerImageUrl={values.headerImageUrl}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className={view === 'edit' ? 'flex flex-col gap-5' : 'hidden'}
      >
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
        <FormField label="Excerpt" htmlFor="excerpt">
          <Input
            id="excerpt"
            value={values.excerpt}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, excerpt: event.target.value }))
            }
          />
        </FormField>
        <FormField
          label="Header image URL (optional)"
          htmlFor="headerImageUrl"
          hint="Leave empty to use the generated cover template"
        >
          <Input
            id="headerImageUrl"
            type="url"
            placeholder="https://…"
            value={values.headerImageUrl}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, headerImageUrl: event.target.value }))
            }
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
        <MonacoField
          label="Content (Markdown)"
          language="markdown"
          value={values.content}
          onChange={(content) => setValues((prev) => ({ ...prev, content }))}
        />
        <FormError message={error} />
        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : post ? 'Save changes' : 'Create post'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/blog')}
          >
            Cancel
          </Button>
        </div>
      </form>

      {view !== 'edit' && <FormError message={error} />}
    </div>
  );
}
