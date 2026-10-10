/** Login redirects stay within the authenticated admin application. */
export function adminReturnPath(value: string | null): string {
  if (
    !value ||
    (value !== '/admin' && !value.startsWith('/admin/')) ||
    value.includes('\\') ||
    /%2f|%5c|%0[ad]/i.test(value) ||
    [...value].some((character) => character.charCodeAt(0) < 32)
  )
    return '/admin';
  return value;
}
