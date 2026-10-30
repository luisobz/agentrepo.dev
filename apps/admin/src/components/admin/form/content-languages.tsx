'use client';
import { LazyReadFields } from './lazy-read-fields';

import {
  contentLocaleSchema,
  type ContentLocale,
  type ContentTranslations,
  type FileTree,
} from '@agentrepo/trpc/schemas';
import { useState } from 'react';
import { FormField } from './form-field';
import { MonacoField } from './monaco-field';

type Translation = NonNullable<ContentTranslations['en']>;
type Kind = 'skill' | 'agent' | 'blog';
const LANGUAGES = { en: 'English', es: 'Español' };

export function useContentLanguages(initial?: {
  sourceLocale?: ContentLocale;
  translations?: ContentTranslations;
}) {
  const [sourceLocale, setSourceLocale] = useState<ContentLocale>(
    initial?.sourceLocale ?? 'en',
  );
  const [translations, setTranslations] = useState<ContentTranslations>(
    initial?.translations ?? {},
  );
  return { sourceLocale, setSourceLocale, translations, setTranslations };
}

function markdownPaths(tree: FileTree, prefix = ''): string[] {
  return tree.flatMap((node) =>
    node.type === 'directory'
      ? markdownPaths(node.children, prefix + node.name + '/')
      : /\.md$/i.test(node.name)
        ? [prefix + node.name]
        : [],
  );
}

export function ContentLanguages({
  kind,
  value,
  fileTree = [],
  disabled = false,
}: {
  kind: Kind;
  value: ReturnType<typeof useContentLanguages>;
  fileTree?: FileTree;
  disabled?: boolean;
}) {
  const target = value.sourceLocale === 'en' ? 'es' : 'en';
  const translation = value.translations[target];
  const patch = (field: keyof Translation, text: string) =>
    value.setTranslations((previous) => ({
      ...previous,
      [target]: { ...previous[target], [field]: text || undefined },
    }));
  const fields: {
    key: keyof Translation;
    label: string;
    markdown?: boolean;
  }[] = [
    { key: 'title', label: 'Title / Título' },
    kind === 'skill'
      ? { key: 'description', label: 'Description / Descripción' }
      : kind === 'agent'
        ? {
            key: 'shortDescription',
            label: 'Short description / Descripción breve',
          }
        : { key: 'excerpt', label: 'Excerpt / Extracto' },
    {
      key: kind === 'agent' ? 'readmeContent' : 'content',
      label: 'Content / Contenido',
      markdown: true,
    },
    ...(kind !== 'blog'
      ? [
          {
            key: 'previewContent' as const,
            label: 'Premium preview / Vista previa',
            markdown: true,
          },
        ]
      : []),
  ];
  return (
    <fieldset
      disabled={disabled}
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-[var(--color-border-soft)] p-4"
    >
      <legend className="px-2 font-semibold">Languages / Idiomas</legend>
      <FormField
        label="Original language / Idioma original"
        htmlFor="content-source-locale"
      >
        <select
          id="content-source-locale"
          value={value.sourceLocale}
          onChange={(event) =>
            value.setSourceLocale(contentLocaleSchema.parse(event.target.value))
          }
          className="rounded-md border p-2"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </FormField>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Los campos principales contienen el original. Las traducciones son
        opcionales; si faltan, se muestra el original. Publica una nueva versión
        para fijar sus traducciones en un snapshot.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(translation)}
          onChange={(event) =>
            value.setTranslations((previous) => {
              const next = { ...previous };
              if (event.target.checked) next[target] = {};
              else delete next[target];
              return next;
            })
          }
        />{' '}
        {LANGUAGES[target]}
      </label>
      {translation &&
        fields.map(({ key, label, markdown }) =>
          markdown ? (
            <MonacoField
              key={target + key}
              label={`${LANGUAGES[target]} · ${label}`}
              language="markdown"
              value={
                typeof translation[key] === 'string' ? translation[key] : ''
              }
              onChange={(text) => patch(key, text)}
              height="240px"
            />
          ) : (
            <FormField
              key={target + key}
              label={`${LANGUAGES[target]} · ${label}`}
              htmlFor={`translation-${target}-${key}`}
            >
              <input
                id={`translation-${target}-${key}`}
                value={
                  typeof translation[key] === 'string' ? translation[key] : ''
                }
                onChange={(event) => patch(key, event.target.value)}
                className="w-full rounded-md border bg-transparent p-2"
              />
            </FormField>
          ),
        )}
      {translation && kind === 'blog' && (
        <LazyReadFields
          prefix={`translation-${target}`}
          summary={translation.lazyRead?.summary ?? ''}
          points={translation.lazyRead?.points.join('\n') ?? ''}
          onSummary={(summary) =>
            value.setTranslations((previous) => ({
              ...previous,
              [target]: {
                ...previous[target],
                lazyRead:
                  summary.trim() || previous[target]?.lazyRead?.points.length
                    ? {
                        summary,
                        points: previous[target]?.lazyRead?.points ?? [],
                      }
                    : null,
              },
            }))
          }
          onPoints={(points) =>
            value.setTranslations((previous) => ({
              ...previous,
              [target]: {
                ...previous[target],
                lazyRead:
                  points.trim() || previous[target]?.lazyRead?.summary.trim()
                    ? {
                        summary: previous[target]?.lazyRead?.summary ?? '',
                        points: points
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean),
                      }
                    : null,
              },
            }))
          }
          disabled={disabled}
        />
      )}
      {translation &&
        kind === 'agent' &&
        markdownPaths(fileTree).map((path) => (
          <MonacoField
            key={target + path}
            label={`${LANGUAGES[target]} · ${path}`}
            language="markdown"
            value={translation.files?.[path] ?? ''}
            onChange={(text) =>
              value.setTranslations((previous) => {
                const files = { ...previous[target]?.files };
                if (text) files[path] = text;
                else delete files[path];
                return {
                  ...previous,
                  [target]: { ...previous[target], files },
                };
              })
            }
            height="220px"
            hint="Vacío: conserva el fichero original. Solo se traducen documentos Markdown."
          />
        ))}
    </fieldset>
  );
}
