import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';

/**
 * At-rest encryption for seed data committed to the public repository.
 * AES-256-GCM with a key derived (scrypt) from SEED_ENCRYPTION_KEY.
 *
 * File layout: a magic first line (checked by the pre-commit guard) followed
 * by base64(salt[16] | iv[12] | authTag[16] | ciphertext).
 */
export const SEED_ENC_MAGIC = 'AGENTREPO-SEED-ENC-V1';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH);
}

export function encryptSeedData(plaintext: string, secret: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret, salt), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const payload = Buffer.concat([salt, iv, cipher.getAuthTag(), ciphertext]);
  return `${SEED_ENC_MAGIC}\n${payload.toString('base64')}\n`;
}

export function decryptSeedData(fileContent: string, secret: string): string {
  const [magic, body] = fileContent.split('\n', 2);
  if (magic !== SEED_ENC_MAGIC || !body) {
    throw new Error(
      `Unrecognised encrypted seed format (expected "${SEED_ENC_MAGIC}" header)`
    );
  }
  const payload = Buffer.from(body.trim(), 'base64');
  const salt = payload.subarray(0, SALT_LENGTH);
  const iv = payload.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = payload.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = payload.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret, salt), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
