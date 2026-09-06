import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomInt } from 'node:crypto';
import { PrismaProvider } from '@carbroz/platform-database';
import { AUTH_SECURITY_POLICY } from '@carbroz/domain-identity';
import { NodeAuthSecurityProvider } from '../../domains/identity/infrastructure/security/NodeAuthSecurityProvider.js';
import { PrismaOtpChallengeRepository } from '../../domains/identity/infrastructure/repositories/PrismaOtpChallengeRepository.js';
import { PrismaRefreshTokenRepository } from '../../domains/identity/infrastructure/repositories/PrismaRefreshTokenRepository.js';
import { PrismaUserSessionRepository } from '../../domains/identity/infrastructure/repositories/PrismaUserSessionRepository.js';

const provider = new PrismaProvider();
const prisma = provider.getClient();
const phoneNumber = `9198${randomInt(10_000_000, 99_999_999)}`;
let userId: number | undefined;

beforeAll(async () => {
  await provider.connect();
});

afterAll(async () => {
  if (userId) {
    const sessions = await prisma.userSession.findMany({ where: { userId }, select: { id: true } });
    const sessionIds = sessions.map((item) => item.id);
    if (sessionIds.length > 0) {
      await prisma.refreshToken.deleteMany({ where: { sessionId: { in: sessionIds } } });
      await prisma.userSession.deleteMany({ where: { id: { in: sessionIds } } });
    }
    await prisma.user.deleteMany({ where: { id: userId } });
  }
  await prisma.otpChallenge.deleteMany({ where: { phoneNumber } });
  await provider.disconnect();
});

describe('CW5 Identity security persistence on PostgreSQL', () => {
  it('stores OTP/refresh hashes, consumes OTP once, rotates refresh tokens, and revokes a replayed family', async () => {
    const security = new NodeAuthSecurityProvider();
    const otpRepository = new PrismaOtpChallengeRepository(prisma);
    const sessionRepository = new PrismaUserSessionRepository(prisma);
    const refreshRepository = new PrismaRefreshTokenRepository(prisma);
    const now = new Date();

    const rawOtp = '654321';
    const otpHash = await security.hashSecret(rawOtp);
    const challenge = await otpRepository.create({
      phoneNumber,
      deviceId: 'cw5-device',
      otpHash,
      maxAttempts: AUTH_SECURITY_POLICY.otp.maxAttempts,
      expiresAt: new Date(now.getTime() + AUTH_SECURITY_POLICY.otp.ttlMs),
    });

    const persistedChallenge = await prisma.otpChallenge.findUnique({ where: { id: challenge.id } });
    expect(persistedChallenge?.otpHash).toBe(otpHash);
    expect(persistedChallenge?.otpHash).not.toBe(rawOtp);
    await expect(security.verifySecret(rawOtp, persistedChallenge!.otpHash)).resolves.toBe(true);
    await expect(otpRepository.tryConsume(challenge.id, new Date(), challenge.maxAttempts)).resolves.toBe(true);
    await expect(otpRepository.tryConsume(challenge.id, new Date(), challenge.maxAttempts)).resolves.toBe(false);

    const createdUser = await prisma.user.create({
      data: { phoneNumber, isGuest: false, role: 'USER' },
    });
    userId = createdUser.id;
    const session = await sessionRepository.upsert(createdUser.id, 'cw5-device', { lastActiveAt: new Date() });

    const firstRaw = security.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    const firstHash = security.hashRefreshToken(firstRaw);
    const familyId = security.generateTokenFamilyId();
    await refreshRepository.issue({
      sessionId: session.id,
      tokenHash: firstHash,
      familyId,
      expiresAt: new Date(Date.now() + AUTH_SECURITY_POLICY.refresh.ttlMs),
      now: new Date(),
    });

    const firstPersisted = await prisma.refreshToken.findUnique({ where: { tokenHash: firstHash } });
    expect(firstPersisted?.tokenHash).toBe(firstHash);
    expect(firstPersisted?.tokenHash).not.toBe(firstRaw);
    expect(firstPersisted?.familyId).toBe(familyId);

    const replacementRaw = security.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    const replacementHash = security.hashRefreshToken(replacementRaw);
    const rotation = await refreshRepository.rotate({
      currentTokenHash: firstHash,
      deviceId: 'cw5-device',
      replacementTokenHash: replacementHash,
      replacementExpiresAt: new Date(Date.now() + AUTH_SECURITY_POLICY.refresh.ttlMs),
      now: new Date(),
    });
    expect(rotation.status).toBe('ROTATED');
    expect(rotation.session?.id).toBe(session.id);

    const consumed = await prisma.refreshToken.findUnique({ where: { tokenHash: firstHash } });
    const replacement = await prisma.refreshToken.findUnique({ where: { tokenHash: replacementHash } });
    expect(consumed?.consumedAt).not.toBeNull();
    expect(replacement?.revokedAt).toBeNull();
    expect(replacement?.tokenHash).not.toBe(replacementRaw);

    const replay = await refreshRepository.rotate({
      currentTokenHash: firstHash,
      deviceId: 'cw5-device',
      replacementTokenHash: security.hashRefreshToken(
        security.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes),
      ),
      replacementExpiresAt: new Date(Date.now() + AUTH_SECURITY_POLICY.refresh.ttlMs),
      now: new Date(),
    });
    expect(replay.status).toBe('REUSED');

    const revokedSession = await prisma.userSession.findUnique({ where: { id: session.id } });
    const family = await prisma.refreshToken.findMany({ where: { familyId } });
    expect(revokedSession?.isRevoked).toBe(true);
    expect(family).toHaveLength(2);
    expect(family.every((item) => item.revokedAt !== null)).toBe(true);
  });
});
