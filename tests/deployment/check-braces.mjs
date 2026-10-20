import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const braces = require(resolve('node_modules/.pnpm/node_modules/braces'));
assert.deepEqual(braces.expand('src/{web,api}/*.{js,ts}'), [
  'src/web/*.js',
  'src/web/*.ts',
  'src/api/*.js',
  'src/api/*.ts',
]);
for (const pattern of [
  '{'.repeat(4000) + 'a,b' + '}'.repeat(4000),
  '('.repeat(4000) + 'a' + ')'.repeat(4000),
]) {
  assert.throws(
    () => braces.compile(pattern),
    (error) =>
      error instanceof SyntaxError && error.message.includes('nesting limit'),
  );
  assert.throws(
    () => braces.expand(pattern),
    (error) =>
      error instanceof SyntaxError && error.message.includes('nesting limit'),
  );
}
console.log(
  'Ordinary brace patterns work; deeply nested input fails before recursive traversal',
);

let ast = { type: 'text', value: 'safe' };
for (let i = 0; i < 200; i++) ast = { type: 'root', nodes: [ast] };
for (const operation of [braces.compile, braces.expand, braces.stringify]) {
  assert.throws(() => operation(ast), error => error instanceof SyntaxError && error.message.includes('nesting limit'));
}
