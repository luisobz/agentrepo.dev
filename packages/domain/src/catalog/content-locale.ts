import { readingSummaryFromJson, type ReadingSummary } from './reading-summary';
import type { FileTree } from './file-tree';

export const CONTENT_LOCALES = ['en', 'es'] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

/** Translatable prose; executable files and identifiers stay in the source. */
export type ContentTranslation = {
  lazyRead?: ReadingSummary | null;
  title?: string;
  description?: string;
  shortDescription?: string;
  excerpt?: string;
  content?: string;
  readmeContent?: string;
  previewContent?: string;
  changelog?: string;
  /** Markdown path → translated body, with the original tree structure. */
  files?: Record<string, string>;
};
export type ContentTranslations = Partial<
  Record<ContentLocale, ContentTranslation>
>;
export interface LocalizedContent {
  sourceLocale?: ContentLocale;
  translations?: ContentTranslations;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Decode storage at the boundary; malformed legacy JSON never becomes prose. */
export function contentTranslationsFromJson(
  value: unknown,
): ContentTranslations {
  if (!isRecord(value)) return {};
  const result: ContentTranslations = {};
  const fields = [
    'title',
    'description',
    'shortDescription',
    'excerpt',
    'content',
    'readmeContent',
    'previewContent',
    'changelog',
  ] as const;
  for (const locale of CONTENT_LOCALES) {
    const row = value[locale];
    if (!isRecord(row)) continue;
    const translation: ContentTranslation = {};
    for (const field of fields) {
      if (typeof row[field] === 'string') translation[field] = row[field];
    }
    const lazyRead = readingSummaryFromJson(row['lazyRead']);
    if (lazyRead) translation.lazyRead = lazyRead;
    if (isRecord(row['files'])) {
      translation.files = {};
      for (const [path, body] of Object.entries(row['files'])) {
        if (typeof body === 'string' && isDocumentationPath(path)) {
          translation.files[path] = body;
        }
      }
    }
    result[locale] = translation;
  }
  return result;
}

export function isDocumentationPath(path: string): boolean {
  return (
    !path.startsWith('/') &&
    !path.includes('\\') &&
    path
      .split('/')
      .every((part) => part !== '' && part !== '.' && part !== '..') &&
    /\.md$/i.test(path)
  );
}

export function localizeDocumentation(
  tree: FileTree,
  files: Record<string, string>,
  prefix = '',
): FileTree {
  return tree.map((node) => {
    const path = prefix + node.name;
    return node.type === 'directory'
      ? {
          ...node,
          children: localizeDocumentation(node.children, files, path + '/'),
        }
      : {
          ...node,
          content: isDocumentationPath(path)
            ? (files[path] ?? node.content)
            : node.content,
        };
  });
}

/** Omitted locale preserves registry bytes for existing CLI locks. */
export function localizeContent<
  T extends LocalizedContent & { fileTree?: FileTree },
>(item: T, locale?: ContentLocale) {
  const { translations, ...source } = item;
  const sourceLocale = item.sourceLocale ?? 'en';
  const translation =
    locale && locale !== sourceLocale ? translations?.[locale] : undefined;
  const { files } = translation ?? {};
  // Only existing prose fields may be replaced: a translation cannot add a
  // second content channel that bypasses the entity's premium projection.
  const prose = Object.fromEntries(
    Object.entries(translation ?? {}).filter(
      ([key, value]) =>
        key !== 'files' &&
        typeof value === 'string' &&
        Object.hasOwn(source, key),
    ),
  );
  const bodyField =
    'content' in source
      ? 'content'
      : 'readmeContent' in source &&
          typeof source.readmeContent === 'string' &&
          source.readmeContent.length > 0
        ? 'readmeContent'
        : undefined;
  const hasTranslatedBody =
    translation && (!bodyField || typeof translation[bodyField] === 'string');
  return {
    ...source,
    ...prose,
    contentLocale: hasTranslatedBody ? (locale ?? sourceLocale) : sourceLocale,
    availableLocales: CONTENT_LOCALES.filter(
      (value) => value === sourceLocale || translations?.[value],
    ),
    ...(item.fileTree && files
      ? { fileTree: localizeDocumentation(item.fileTree, files) }
      : {}),
  };
}

export function contentLocaleFromStorage(value: unknown): ContentLocale {
  return value === 'es' ? 'es' : 'en';
}
