import { expect, it } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { finishLocaleResponse, prepareLocaleRequest } from './request-routing';
it('preserves POST bodies on operational routes', async () => {
  const original = new NextRequest('https://example.test/api/creator/submit', {
    method: 'POST',
    body: '{"example":true}',
    headers: { 'content-type': 'application/json' },
  });
  const routing = prepareLocaleRequest(original);
  expect(routing.redirect).toBeNull();
  expect(await routing.request.json()).toEqual({ example: true });
});
it('preserves refreshed cookies and cache headers through the locale rewrite', () => {
  const routing = prepareLocaleRequest(
    new NextRequest('https://example.test/es/blog/example'),
  );
  routing.request.cookies.set('sb-test-auth-token', 'refreshed');
  const response = NextResponse.next();
  response.cookies.set('sb-test-auth-token', 'refreshed', { httpOnly: true });
  response.headers.set('cache-control', 'private, no-store');
  const result = finishLocaleResponse(response, routing);
  expect(result.cookies.get('sb-test-auth-token')?.value).toBe('refreshed');
  expect(result.headers.get('cache-control')).toBe('private, no-store');
  expect(result.headers.get('x-middleware-request-cookie')).toContain(
    'sb-test-auth-token=refreshed',
  );
});
