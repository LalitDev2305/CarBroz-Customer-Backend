import { describe, expect, it, vi } from 'vitest';
import {
  AUTH_SECURITY_POLICY,
  RefreshTokenUseCase,
  SendOtpUseCase,
  type IRefreshTokenRepository,
  type IOtpChallengeRepository,
  type IOtpDeliveryProvider,
  type IUserRepository,
  type RefreshRotationResult,
  type User,
  type UserSession,
} from '../public/index.js';
import { NodeAuthSecurityProvider } from '../infrastructure/security/NodeAuthSecurityProvider.js';

const now = new Date('2026-09-06T00:00:00.000Z');
const user: User = {
  id: 11,
  publicId: 'user-11',
  email: null,
  phoneNumber: '919999999999',
  isGuest: false,
  role: 'USER',
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};
const session: UserSession = {
  id: 22,
  publicId: 'session-22',
  userId: user.id,
  deviceId: 'device-1',
  deviceModel: null,
  osVersion: null,
  fcmToken: null,
  isRevoked: false,
  lastActiveAt: now,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
  user,
};

describe('CW5 Identity authentication security primitives', () => {
  it('uses cryptographic OTP hashing and opaque 256-bit refresh material', async () => {
    const security = new NodeAuthSecurityProvider();
    const otp = security.generateOtp(AUTH_SECURITY_POLICY.otp.length);
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

  it('persists only the OTP hash, never returns the delivered OTP, and returns the frozen Phase 6 destination', async () => {
    const security = new NodeAuthSecurityProvider();
    let persistedHash = '';
    let deliveredOtp = '';
    const userRepository: IUserRepository = {
      findById: vi.fn(async () => null),
      findAll: vi.fn(async () => []),
      save: vi.fn(async () => user),
      delete: vi.fn(async () => true),
      findByPhoneNumber: vi.fn(async () => null),
      upsert: vi.fn(async () => user),
    };
    const createChallenge = async (input: Parameters<IOtpChallengeRepository['create']>[0]) => {
      persistedHash = input.otpHash;
      return {
        id: 33,
        publicId: '33333333-3333-4333-8333-333333333333',
        phoneNumber: input.phoneNumber,
        deviceId: input.deviceId,
        otpHash: input.otpHash,
        attemptCount: 0,
        maxAttempts: input.maxAttempts,
        expiresAt: input.expiresAt,
        consumedAt: null,
        invalidatedAt: null,
        createdAt: now,
        updatedAt: now,
      };
    };
    const otpRepository: IOtpChallengeRepository = {
      create: vi.fn(createChallenge),
      tryCreateWithinRateLimit: vi.fn(async (input) => createChallenge(input)),
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
      userRepository,
      otpRepository,
      delivery,
      security,
    ).execute({ phoneNumber: '919999999999', deviceId: 'device-1' });

    expect(result.message).toBe('OTP sent successfully');
    expect(result.challengeId).toBe('33333333-3333-4333-8333-333333333333');
    expect(result.expiresInSeconds).toBe(AUTH_SECURITY_POLICY.otp.ttlMs / 1000);
    expect(result.isNewUser).toBe(true);
    expect(result.nextScreen).toEqual({
      screenId: 'partner_otp',
      templateId: 'tpl_partner_otp_v1',
      templateType: 'form_template',
      endpoint: '/api/v1/partner/screen/auth_otp',
      method: 'GET',
      authentication: 'NONE',
    });
    expect(Object.keys(result.nextScreen).sort()).toEqual([
      'authentication',
      'endpoint',
      'method',
      'screenId',
      'templateId',
      'templateType',
    ]);
    expect(result.nextScreen).not.toHaveProperty('template');
    expect(result.nextScreen).not.toHaveProperty('api');
    expect(result).not.toHaveProperty('otp');
    expect(result).not.toHaveProperty('mockOtp');
    expect(persistedHash).not.toBe(deliveredOtp);
    await expect(security.verifySecret(deliveredOtp, persistedHash)).resolves.toBe(true);
  });

  it('submits only refresh hashes to rotation and returns only the newly generated raw replacement', async () => {
    const security = new NodeAuthSecurityProvider();
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
    expect(result.session).not.toHaveProperty('refreshToken');
  });
});
