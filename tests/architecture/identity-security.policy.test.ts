import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => fs.readFileSync(path, 'utf8');

const auth = read('domains/identity/application/AuthUseCases.ts');
const session = read('domains/identity/domain/UserSession.ts');
const schema = read('prisma/schema.prisma');
const transport = read('apps/api/src/transport/auth/auth.controller.ts');
const runtimeConfig = read('apps/api/src/bootstrap/config/runtime-config.ts');
const migration = read('prisma/migrations/20260906193000_cw5_identity_security/migration.sql');

describe('CW5 Identity §41 architecture regression policy', () => {
  it('rejects mock OTPs and predictable refresh-token construction', () => {
    expect(auth).not.toMatch(/\bmockOtp\b/);
    expect(auth).not.toMatch(/otp\s*!==\s*['"](?:123456|111111)['"]/);
    expect(auth).not.toMatch(/Buffer\.from\([^\n]*Date\.now\(/);
    expect(auth).toContain('verifySecret');
    expect(auth).toContain('tryConsume');
    expect(auth).toContain('hashRefreshToken');
    expect(auth).toContain('refreshTokenRepository.rotate');
  });

  it('keeps raw refresh material out of session persistence and transport reads', () => {
    expect(session).not.toContain('refreshToken: string');
    expect(schema).not.toMatch(/\n\s*refreshToken\s+String\?/);
    expect(schema).toContain('tokenHash  String    @unique');
    expect(schema).toContain('familyId   String');
    expect(schema).toContain('consumedAt DateTime?');
    expect(schema).toContain('revokedAt  DateTime?');
    expect(transport).not.toContain('result.session.refreshToken');
    expect(transport).toContain('refreshToken: result.refreshToken');
  });

  it('requires persisted OTP challenge lifecycle and an additive legacy-token invalidation migration', () => {
    for (const marker of [
      'model OtpChallenge',
      'otpHash',
      'attemptCount',
      'maxAttempts',
      'expiresAt',
      'consumedAt',
      'invalidatedAt',
    ]) expect(schema).toContain(marker);

    expect(migration).toContain('UPDATE "UserSession"');
    expect(migration).toContain('"isRevoked" = true');
    expect(migration).toContain('DROP COLUMN "refreshToken"');
    expect(migration).toContain('RENAME COLUMN "token" TO "tokenHash"');
    expect(migration).toContain('CREATE TABLE "OtpChallenge"');
  });

  it('requires production OTP provider configuration rather than a development fallback', () => {
    for (const marker of ['MSG91_AUTH_KEY', 'MSG91_OTP_TEMPLATE_ID', 'MSG91_OTP_VARIABLE_NAME']) {
      expect(runtimeConfig).toContain(marker);
    }
    expect(runtimeConfig).toContain("value.NODE_ENV !== 'production'");
  });
});
