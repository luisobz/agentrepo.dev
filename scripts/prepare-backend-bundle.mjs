import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const directory = resolve(process.argv[2]);
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const manifestPath = resolve(directory, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.pnpm = { ...manifest.pnpm, overrides: root.pnpm.overrides };
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  resolve(directory, 'pnpm-workspace.yaml'),
  "packages:\n  - 'workspace_modules/@agentrepo/*'\n",
);
