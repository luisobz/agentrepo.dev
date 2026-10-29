import { NextRequest, NextResponse } from 'next/server';
import {
  detectLocale,
  isLocalizedPage,
  localizedHref,
  REQUEST_LOCALE,
  REQUEST_PATH,
  splitLocalePath,
} from './routing';

export function prepareLocaleRequest(original: NextRequest) {
  const { locale, pathname } = splitLocalePath(original.nextUrl.pathname);
  const selected =
    locale ??
    detectLocale(
      original.cookies.get('locale')?.value,
      original.headers.get('accept-language'),
    );
  const headers = new Headers(original.headers);
  headers.set(REQUEST_LOCALE, selected);
  headers.set(REQUEST_PATH, pathname);
  const target = original.nextUrl.clone();
  if (
    !locale &&
    isLocalizedPage(pathname) &&
    ['GET', 'HEAD'].includes(original.method)
  ) {
    target.pathname = localizedHref(pathname, selected);
    const redirect = NextResponse.redirect(target, 307);
    redirect.headers.set('Vary', 'Cookie, Accept-Language');
    redirect.headers.set('Cache-Control', 'private, no-store');
    return { request: original, redirect, target: null, headers };
  }
  if (locale && !isLocalizedPage(pathname)) {
    return {
      request: original,
      redirect: new NextResponse(null, { status: 404 }),
      target: null,
      headers,
    };
  }
  target.pathname = pathname;
  const request = new NextRequest(original, { headers });
  request.nextUrl.pathname = pathname;
  return { request, redirect: null, target: locale ? target : null, headers };
}

export function finishLocaleResponse(
  response: NextResponse,
  routing: ReturnType<typeof prepareLocaleRequest>,
) {
  const location = response.headers.get('location');
  if (location && routing.target) {
    const destination = new URL(location, routing.request.url);
    if (destination.origin === routing.request.nextUrl.origin) {
      destination.pathname = localizedHref(
        destination.pathname,
        routing.headers.get(REQUEST_LOCALE) === 'es' ? 'es' : 'en',
      );
      response.headers.set('location', destination.toString());
    }
  }
  if (response.headers.get('x-middleware-next')) {
    const next = NextResponse.next({
      request: { headers: routing.request.headers },
    });
    for (const [name, value] of response.headers) {
      if (!name.startsWith('x-middleware-') && name !== 'set-cookie')
        next.headers.set(name, value);
    }
    for (const cookie of response.cookies.getAll()) next.cookies.set(cookie);
    return next;
  }
  return response;
}
