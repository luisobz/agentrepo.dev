/** Public URL is configured explicitly because Passenger forwards internal URLs. */
export function publicRequestOrigin(request: Request): string {
  return new URL(process.env['ADMIN_APP_URL'] || request.url).origin;
}

export function hasTrustedOrigin(request: Request): boolean {
  try {
    return request.headers.get('origin') === publicRequestOrigin(request);
  } catch {
    return false;
  }
}
