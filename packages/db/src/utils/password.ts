import { scryptAsync } from '@noble/hashes/scrypt.js';
import { bytesToHex } from '@noble/hashes/utils.js';

/**
 * Scrypt configuration matching Better Auth's defaults.
 * @see https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/crypto/password.ts
 */
const SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
} as const;

/**
 * Hash a password using scrypt, matching Better Auth's exact format.
 *
 * Format: `{salt}:{key}` where both are hex-encoded.
 * - Salt: 16 random bytes (32 hex chars)
 * - Key: 64 bytes from scrypt (128 hex chars)
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to `salt:key` hash string
 */
export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToHex(saltBytes);

  const key = await scryptAsync(password.normalize('NFKC'), salt, {
    N: SCRYPT_CONFIG.N,
    r: SCRYPT_CONFIG.r,
    p: SCRYPT_CONFIG.p,
    dkLen: SCRYPT_CONFIG.dkLen,
    maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
  });

  return `${salt}:${bytesToHex(key)}`;
}
