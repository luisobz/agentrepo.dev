#!/usr/bin/env node
/**
 * Pre-commit guard: blocks commits that would leak secrets to the public repo.
 *  - plaintext production seed data (prod.seed.data.json)
 *  - certificates / private keys (.crt, .cer, .pem, .key, .p12, .pfx)
 *  - encrypted seed files (.enc) whose staged content is NOT actually
 *    encrypted (missing the AGENTREPO-SEED-ENC-V1 header)
 */
import { execFileSync } from 'node:child_process';

const SEED_ENC_MAGIC = 'AGENTREPO-SEED-ENC-V1';
const CERT_FILE_RE = /\.(crt|cer|pem|key|p12|pfx)$/i;

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

const staged = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'])
  .split('\0')
  .filter(Boolean);

const problems = [];

for (const file of staged) {
  if (file.endsWith('prod.seed.data.json')) {
    problems.push(
      `${file}: plaintext production seed data must never be committed — run "pnpm db:seed:encrypt" and commit the .enc file instead`
    );
  }
  if (CERT_FILE_RE.test(file)) {
    problems.push(`${file}: certificates and private keys must never be committed`);
  }
  if (file.endsWith('.enc')) {
    const content = git(['show', `:${file}`]);
    if (!content.startsWith(SEED_ENC_MAGIC)) {
      problems.push(
        `${file}: staged content is not encrypted (missing "${SEED_ENC_MAGIC}" header) — run "pnpm db:seed:encrypt"`
      );
    }
  }
}

if (problems.length > 0) {
  console.error('✖ Commit blocked by scripts/check-secrets-staged.mjs:\n');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error('\nUnstage the offending files (git restore --staged <file>) and retry.');
  process.exit(1);
}
