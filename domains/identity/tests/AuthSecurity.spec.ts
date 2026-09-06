import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@carbroz/foundation-kernel';
import {
  AUTH_SECURITY_POLICY,
  LogoutUseCase,
  RefreshTokenUseCase,
  SendOtpUseCase,
  VerifyOtpUseCase,
  type IAuthSecurityProvider,
  type IOtpChallengeRepository,
  type IOtpDeliveryProvider,
  type IRefreshTokenRepository,
  type IUserRepository,
  type IUserSessionRepository,
  type OtpChallenge,
  type RefreshRotationResult,
  type User,
  type UserSession,
} from '../public/index.js';
import { NodeAuthSecurityProvider } from '../infrastructure/security/NodeAuthSecurityProvider.js';

const user: User = {
  id: 11,
  publicId: '11111111-1111-4111-8111-111111111111',
  email: null,
  phoneNumber: '919999999999',
  isGuest: false,
  role: 'USER',
  createdAt: new Date('2026-09-06T00:00:00.000Z'),
  updatedAt: new Date('2026-09-06T00:00:00.000Z'),
  deletedAt: null,
};

const session: UserSession = {
  id: 22,
  publicId: '22222222-2222-4222-8222-222222222222',
  userId: user.id,
  deviceId: 'device-1',
  deviceModel: 'Pixel',
  osVersion: '16',
  fcmToken: null,
  isRevoked: false,
  lastActiveAt: new Date('2026-09-06T00:00:00.000Z'),
  createdAt: new Date('2026-09-06T00:00:00.000Z'),
  updatedAt: new Date('2026-09-06T00:00:00.000Z'),
  deletedAt: null,
  user,
};

function userRepository(found: User | null = null): IUserRepository {
  return {
    findById: vi.fn(async () => found),
    findAll: vi.fn(async () => found ? [found] : []),
    save: vi.fn(async () => user),
    delete: vi.fn(async () => true),
    findByPhoneNumber: vi.fn(async () => found),
    upsert: vi.fn(async () => user),
  };
}

function sessionRepository(): IUserSessionRepository {
  return {
    findById: vi.fn(async () => session),
    findAll: vi.fn(async () => [session]),
    save: vi.fn(async () => session),
    delete: vi.fn(async () => true),
    findByDevice: vi.fn(async () => session),
    upsert: vi.fn(async () => session),
    revokeAllForUser: vi.fn(async () => undefined),
  };
}

function challenge(overrides: Partial<OtpChallenge> = {}): OtpChallenge {
  return {
    id: 33,
    publicId: '33333333-3333-4333-8333-333333333333',
    phoneNumber: '919999999999',
    deviceId: 'device-1',
    otpHash: 'hash',
    attemptCount: 0,
    maxAttempts: AUTH_SECURITY_POLICY.otp.maxAttempts,
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    invalidatedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CW5 Identity authentication security', () => {
  it('uses cryptographic primitives for OTP hashing and opaque refresh material', async () => {
    const security = new NodeAuthSecurityProvider();
    const otp = security.generateOtp(6);
    expect(otp).toMatch(/^\d{6}$/);

    const encoded = await security.hashSecret(otp);
    expect(encoded).not.toContain(otp);
    await expect(security.verifySecret(otp, encoded)).resolves.toBe(true);
    await expect(security.verifySecret('000000', encoded)).resolves.toBe(false);

    const first = security.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    const second = security.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    expect(first).not.toBe(second);
    expect(Buffer.from(first, 'base64url')).toHaveLength(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    expect(security.hashRefreshToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(security.hashRefreshToken(first)).not.toContain(first);
  });

  it('persists only an OTP hash and never returns the OTP from send flow', async () => {
    const security = new NodeAuthSecurityProvider();
    let persistedHash = '';
    let deliveredOtp = '';

    const otpRepository: IOtpChallengeRepository = {
      create: vi.fn(async (input) => {
        persistedHash = input.otpHash;
        return challenge({
          phoneNumber: input.phoneNumber,
          deviceId: input.deviceId,
          otpHash: input.otpHash,
          maxAttempts: input.maxAttempts,
          expiresAt: input.expiresAt,
        });
      }),
      findForVerification: vi.fn(async () => null),
      findLatestByPhone: vi.fn(async () => null),
      countCreatedSince: vi.fn(async () => 0),
      recordFailedAttempt: vi.fn(async () => null),
      tryConsume: vi.fn(async () => false),
      invalidate: vi.fn(async () => undefined),
    };
    const delivery: IOtpDeliveryProvider = {
      sendOtp: vi.fn(async (input) => {
        deliveredOtp = input.otp;
        return { success: true, providerReference: 'msg91-request' };
      }),
    };

    const result = await new SendOtpUseCase(
      userRepository(null),
      otpRepository,
      delivery,
      security,
    ).execute({ phoneNumber: '919999999999', deviceId: 'device-1' });

    expect(result.challengeId).toBe('33333333-3333-4333-8333-333333333333');
    expect(result.expiresInSeconds).toBe(300);
    expect('otp' in result).toBe(false);
    expect('mockOtp' in result).toBe(false);
    expect(deliveredOtp).toMatch(/^\d{6}$/);
    expect(persistedHash).not.toBe(deliveredOtp);
    await expect(security.verifySecret(deliveredOtp, persistedHash)).resolves.toBe(true);
  });

  it('enforces resend cooldown before generating another OTP', async () => {
    const otpRepository: IOtpChallengeRepository = {
      create: vi.fn(async () => challenge()),
      findForVerification: vi.fn(async () => null),
      findLatestByPhone: vi.fn(async () => challenge({ createdAt: new Date() })),
      countCreatedSince: vi.fn(async () => 0),
      recordFailedAttempt: vi.fn(async () => null),
      tryConsume: vi.fn(async () => false),
      invalidate: vi.fn(async () => undefined),
    };
    const delivery: IOtpDeliveryProvider = { sendOtp: vi.fn(async () => ({ success: true })) };

    await expect(new SendOtpUseCase(
      userRepository(null),
      otpRepository,
      delivery,
      new NodeAuthSecurityProvider(),
    ).execute({ phoneNumber: '919999999999', deviceId: 'device-1' })).rejects.toMatchObject({
      statusCode: 429,
      errorCode: 'OTP_RESEND_COOLDOWN',
    });
    expect(delivery.sendOtp).not.toHaveBeenCalled();
  });

  it('one-time consumes a challenge and stores only the refresh-token hash', async () => {
    const security = new NodeAuthSecurityProvider();
    const otp = '654321';
    const otpHash = await security.hashSecret(otp);
    let issued: Parameters<IRefreshTokenRepository['issue']>[0] | undefined;

    const otpRepository: IOtpChallengeRepository = {
      create: vi.fn(async () => challenge()),
      findForVerification: vi.fn(async () => challenge({ otpHash })),
      findLatestByPhone: vi.fn(async () => null),
      countCreatedSince: vi.fn(async () => 0),
      recordFailedAttempt: vi.fn(async () => null),
      tryConsume: vi.fn(async () => true),
      invalidate: vi.fn(async () => undefined),
    };
    const refreshRepository: IRefreshTokenRepository = {
      issue: vi.fn(async (input) => { issued = input; }),
      rotate: vi.fn(async () => ({ status: 'INVALID' })),
      revokeSession: vi.fn(async () => undefined),
      revokeAllForUser: vi.fn(async () => undefined),
    };

    const result = await new VerifyOtpUseCase(
      userRepository(null),
      sessionRepository(),
      otpRepository,
      refreshRepository,
      security,
    ).execute({
      challengeId: '33333333-3333-4333-8333-333333333333',
      phoneNumber: '919999999999',
      otp,
      deviceId: 'device-1',
    });

    expect(otpRepository.tryConsume).toHaveBeenCalledTimes(1);
    expect(issued?.sessionId).toBe(session.id);
    expect(issued?.tokenHash).toBe(security.hashRefreshToken(result.refreshToken));
    expect(issued?.tokenHash).not.toBe(result.refreshToken);
    expect(issued?.familyId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(result.session).not.toHaveProperty('refreshToken');
  });

  it('records an invalid OTP attempt without creating a user session', async () => {
    const security = new NodeAuthSecurityProvider();
    const otpHash = await security.hashSecret('654321');
    const otpRepository: IOtpChallengeRepository = {
      create: vi.fn(async () => challenge()),
      findForVerification: vi.fn(async () => challenge({ otpHash })),
      findLatestByPhone: vi.fn(async () => null),
      countCreatedSince: vi.fn(async () => 0),
      recordFailedAttempt: vi.fn(async () => challenge({ otpHash, attemptCount: 1 })),
      tryConsume: vi.fn(async () => true),
      invalidate: vi.fn(async () => undefined),
    };
    const users = userRepository(null);
    const sessions = sessionRepository();
    const refreshRepository: IRefreshTokenRepository = {
      issue: vi.fn(async () => undefined),
      rotate: vi.fn(async () => ({ status: 'INVALID' })),
      revokeSession: vi.fn(async () => undefined),
      revokeAllForUser: vi.fn(async () => undefined),
    };

    await expect(new VerifyOtpUseCase(
      users,
      sessions,
      otpRepository,
      refreshRepository,
      security,
    ).execute({
      challengeId: '33333333-3333-4333-8333-333333333333',
      phoneNumber: '919999999999',
      otp: '000000',
      deviceId: 'device-1',
    })).rejects.toBeInstanceOf(UnauthorizedError);

    expect(otpRepository.recordFailedAttempt).toHaveBeenCalledTimes(1);
    expect(users.upsert).not.toHaveBeenCalled();
    expect(sessions.upsert).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
  });

  it('rotates by hashes and returns only the newly generated raw refresh token', async () => {
    const security: IAuthSecurityProvider = new NodeAuthSecurityProvider();
    let rotationInput: Parameters<IRefreshTokenRepository['rotate']>[0] | undefined;
    const refreshRepository: IRefreshTokenRepository = {
      issue: vi.fn(async () => undefined),
      rotate: vi.fn(async (input): Promise<RefreshRotationResult> => {
        rotationInput = input;
        return { status: 'ROTATED', session };
      }),
      revokeSession: vi.fn(async () => undefined),
      revokeAllForUser: vi.fn(async () => undefined),
    };
    const current = security.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);

    const result = await new RefreshTokenUseCase(refreshRepository, security).execute({
      refreshToken: current,
      deviceId: 'device-1',
    });

    expect(rotationInput?.currentTokenHash).toBe(security.hashRefreshToken(current));
    expect(rotationInput?.replacementTokenHash).toBe(security.hashRefreshToken(result.refreshToken));
    expect(rotationInput?.replacementTokenHash).not.toBe(result.refreshToken);
  });

  it('rejects refresh-token reuse and delegates logout revocation to token families', async () => {
    const refreshRepository: IRefreshTokenRepository = {
      issue: vi.fn(async () => undefined),
      rotate: vi.fn(async () => ({ status: 'REUSED' })),
      revokeSession: vi.fn(async () => undefined),
      revokeAllForUser: vi.fn(async () => undefined),
    };

    await expect(new RefreshTokenUseCase(
      refreshRepository,
      new NodeAuthSecurityProvider(),
    ).execute({ refreshToken: 'x'.repeat(43), deviceId: 'device-1' })).rejects.toBeInstanceOf(UnauthorizedError);

    const logout = new LogoutUseCase(refreshRepository);
    await logout.execute({ sessionId: session.id });
    await logout.execute({ logoutAll: true, userId: user.id });
    expect(refreshRepository.revokeSession).toHaveBeenCalledWith(session.id, expect.any(Date));
    expect(refreshRepository.revokeAllForUser).toHaveBeenCalledWith(user.id, expect.any(Date));
  });
});
