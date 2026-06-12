import { TRPCClientError } from '@trpc/client';

const MAX_PAGE_SIZE = 100;

interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
}

type PageQuery<TItem> = (input: {
  page: number;
  pageSize: number;
}) => Promise<PaginatedResult<TItem>>;

/** Drains a paginated public endpoint until every published item is loaded. */
export async function fetchAllPages<TItem>(
  query: PageQuery<TItem>
): Promise<TItem[]> {
  const items: TItem[] = [];
  let page = 1;
  let total = Infinity;

  while (items.length < total) {
    const result = await query({ page, pageSize: MAX_PAGE_SIZE });
    items.push(...result.items);
    total = result.total;
    if (result.items.length === 0) {
      break;
    }
    page += 1;
  }

  return items;
}

/** True for "this content does not exist publicly" errors (incl. bad slugs). */
export function isClientNotFound(error: unknown): boolean {
  return (
    error instanceof TRPCClientError &&
    (error.data?.code === 'NOT_FOUND' || error.data?.code === 'BAD_REQUEST')
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
}
