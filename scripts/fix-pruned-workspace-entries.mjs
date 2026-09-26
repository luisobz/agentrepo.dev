import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const bundleDirectory = process.argv[2];
const modulesDirectory = join(bundleDirectory, 'workspace_modules', '@agentrepo');

for (const name of readdirSync(modulesDirectory)) {
  const packageDirectory = join(modulesDirectory, name);
  const compiledEntry = join(packageDirectory, 'dist', 'src', 'index.js');
  if (!existsSync(compiledEntry)) continue;

  const manifestPath = join(packageDirectory, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.main = './dist/src/index.js';
  manifest.types = './dist/src/index.d.ts';
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const bundleRequire = createRequire(join(process.cwd(), bundleDirectory, 'src', 'main.js'));
for (const dependency of [
  '@agentrepo/application',
  '@agentrepo/config',
  '@agentrepo/infrastructure',
  '@agentrepo/trpc',
  '@swc/helpers/_/_interop_require_default',
]) {
  bundleRequire.resolve(dependency);
}
