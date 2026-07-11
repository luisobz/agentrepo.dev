/**
 * CLI to (de)encrypt the production seed data with SEED_ENCRYPTION_KEY.
 *
 *   pnpm db:seed:encrypt   prod.seed.data.json  → prod.seed.data.enc (committed)
 *   pnpm db:seed:decrypt   prod.seed.data.enc   → prod.seed.data.json (gitignored)
 */
import { config } from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { decryptSeedData, encryptSeedData } from '../lib/seed-crypto';

config({ path: path.resolve(__dirname, '../../../../../.env') });

const SEEDS_DIR = path.resolve(__dirname, '..');
const PLAIN_FILE = path.join(SEEDS_DIR, 'prod.seed.data.json');
const ENCRYPTED_FILE = path.join(SEEDS_DIR, 'prod.seed.data.enc');

function main() {
  const mode = process.argv[2];
  const key = process.env.SEED_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('SEED_ENCRYPTION_KEY is not set (add it to your .env)');
  }

  if (mode === 'encrypt') {
    if (!existsSync(PLAIN_FILE)) {
      throw new Error(
        `${PLAIN_FILE} not found — copy prod.seed.data.example.json and fill in the real values`
      );
    }
    JSON.parse(readFileSync(PLAIN_FILE, 'utf8')); // fail fast on invalid JSON
    writeFileSync(ENCRYPTED_FILE, encryptSeedData(readFileSync(PLAIN_FILE, 'utf8'), key));
    console.log(`Encrypted seed data written to ${ENCRYPTED_FILE}`);
    console.log('The plaintext prod.seed.data.json stays local (gitignored).');
  } else if (mode === 'decrypt') {
    if (!existsSync(ENCRYPTED_FILE)) {
      throw new Error(`${ENCRYPTED_FILE} not found`);
    }
    writeFileSync(PLAIN_FILE, decryptSeedData(readFileSync(ENCRYPTED_FILE, 'utf8'), key));
    console.log(`Decrypted seed data written to ${PLAIN_FILE} (gitignored — do not commit)`);
  } else {
    throw new Error('Usage: crypt-seed-data.ts <encrypt|decrypt>');
  }
}

main();
