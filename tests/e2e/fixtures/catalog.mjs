import { createServer } from 'node:http';

// Public, empty catalogue fixture. Auth and mutations are deliberately unavailable.
createServer((request, response) => {
  if (request.method !== 'GET') {
    response.writeHead(405).end();
    return;
  }
  const paths = new URL(request.url, 'http://localhost').pathname.split('/').at(-1).split(',');
  const results = paths.map(() => ({ result: { data: { json: {
    items: [], total: 0, page: 1, pageSize: 6,
  } } } }));
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(results));
}).listen(4000, '127.0.0.1');
