/**
 * Converts free text into a `tsquery` that requires every term. With
 * `prefixLast`, the final term matches as a prefix (`revi:*`) so
 * search-as-you-type finds partially typed words.
 */
export function toTsQuery(
  query: string,
  options: { prefixLast?: boolean } = {}
): string {
  const terms = query
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((term) => term.length > 0);

  if (terms.length === 0) {
    return '';
  }

  if (options.prefixLast) {
    terms[terms.length - 1] = `${terms[terms.length - 1]}:*`;
  }

  return terms.join(' & ');
}
