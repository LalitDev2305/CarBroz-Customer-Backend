import { createHash, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import type { IAuthSecurityProvider } from '../../application/ports/IAuthSecurityProvider.js';

const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_KEY_LENGTH = 32;

function deriveSecret(secret: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(secret, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

/** Node-backed cryptographic primitives for Identity security policy. */
export class NodeAuthSecurityProvider implements IAuthSecurityProvider {
  generateOtp(length: number): string {
    if (!Number.isInteger(length) || length < 4 || length > 8) {
      throw new RangeError('OTP length must be an integer between 4 and 8');
    }
    return randomInt(0, 10 ** length).toString().padStart(length, '0');
  }

  async hashSecret(secret: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await deriveSecret(secret, salt);
    return `${SCRYPT_PREFIX}$${salt}$${derivedKey.toString('hex')}`;
  }

  async verifySecret(secret: string, encodedHash: string): Promise<boolean> {
    const [prefix, salt, hash] = encodedHash.split('$');
    if (prefix !== SCRYPT_PREFIX || !salt || !hash || !/^[a-f0-9]+$/i.test(hash)) {
      return false;
    }

    const expected = Buffer.from(hash, 'hex');
    if (expected.length !== SCRYPT_KEY_LENGTH) return false;

    const actual = await deriveSecret(secret, salt);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  generateRefreshToken(bytes: number): string {
    if (!Number.isInteger(bytes) || bytes < 32) {
      throw new RangeError('Refresh tokens require at least 32 random bytes');
    }
    return randomBytes(bytes).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  generateTokenFamilyId(): string {
    return randomUUID();
  }
}
