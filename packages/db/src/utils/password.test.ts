import { describe, it, expect } from 'vitest';
import { hashPassword } from './password.js';
import { verifyPassword } from 'better-auth/crypto';

describe('hashPassword', () => {
  it('returns a string in salt:key format', async () => {
    const hash = await hashPassword('testpassword');
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it('salt is 32 hex characters (16 bytes)', async () => {
    const hash = await hashPassword('testpassword');
    const [salt] = hash.split(':');
    expect(salt).toHaveLength(32);
  });

  it('key is 128 hex characters (64 bytes)', async () => {
    const hash = await hashPassword('testpassword');
    const [, key] = hash.split(':');
    expect(key).toHaveLength(128);
  });

  it('produces different hashes for the same password (salt randomness)', async () => {
    const hash1 = await hashPassword('samepassword');
    const hash2 = await hashPassword('samepassword');
    expect(hash1).not.toBe(hash2);
  });

  it('produces different salts for the same password', async () => {
    const hash1 = await hashPassword('samepassword');
    const hash2 = await hashPassword('samepassword');
    const [salt1] = hash1.split(':');
    const [salt2] = hash2.split(':');
    expect(salt1).not.toBe(salt2);
  });

  it('is compatible with Better Auth verifyPassword', async () => {
    const password = 'mySecurePassword123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword({ hash, password });
    expect(isValid).toBe(true);
  });

  it('verifyPassword rejects wrong password', async () => {
    const hash = await hashPassword('correctPassword');

    const isValid = await verifyPassword({ hash, password: 'wrongPassword' });
    expect(isValid).toBe(false);
  });

  it('handles unicode passwords correctly (NFKC normalization)', async () => {
    // "fi" ligature (U+FB01) should normalize to "fi"
    const password1 = '\uFB01le'; // "file" with fi ligature
    const password2 = 'file'; // "file" with separate f and i

    const hash = await hashPassword(password1);
    // After NFKC normalization, both should verify the same
    const isValid = await verifyPassword({ hash, password: password2 });
    expect(isValid).toBe(true);
  });

  it('handles empty password', async () => {
    const hash = await hashPassword('');
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);

    const isValid = await verifyPassword({ hash, password: '' });
    expect(isValid).toBe(true);
  });
});
