/** Restrict OAuth redirects to unambiguous paths on this application. */
export function safeReturnPath(path: string | null): string {
  if (
    !path?.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    [...path].some((character) => character.charCodeAt(0) < 32) ||
    /%2f|%5c|%0[ad]/i.test(path)
  ) {
    return '/creator';
  }
  return path;
}
