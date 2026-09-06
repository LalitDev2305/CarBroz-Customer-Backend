import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@carbroz/foundation-kernel';
import type { User } from '../domain/User.js';
import type { UserSession } from '../domain/UserSession.js';
import type { OtpChallenge } from '../domain/OtpChallenge.js';
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { IUserSessionRepository } from '../domain/repositories/IUserSessionRepository.js';
import type { IOtpChallengeRepository } from '../domain/repositories/IOtpChallengeRepository.js';
import type {
  IRefreshTokenRepository,
  RefreshRotationResult,
} from '../domain/repositories/IRefreshTokenRepository.js';
import type { IAuthSecurityProvider } from './ports/IAuthSecurityProvider.js';
import type { IOtpDeliveryProvider } from './ports/IOtpDeliveryProvider.js';
import {
  GuestLoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  SendOtpUseCase,
  VerifyOtpUseCase,
} from './AuthUseCases.js';

const now = new Date('2026-09-06T00:00:00.000Z');
const user: User = {
  id: 7,
  publicId: 'user-7',
  email: null,
  phoneNumber: '9999999999',
  role: 'USER',
  isGuest: false,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};
const guest: User = { ...user, id: 8, publicId: 'user-8', phoneNumber: 'guest', role: 'GUEST', isGuest: true };
const session: UserSession = {
  id: 11,
  publicId: 'session-11',
  userId: 7,
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
const challenge: OtpChallenge = {
  id: 21,
  publicId: '11111111-1111-4111-8111-111111111111',
  phoneNumber: '9999999999',
  deviceId: 'device-1',
  otpHash: 'hash:654321',
  attemptCount: 0,
  maxAttempts: 5,
  expiresAt: new Date('2099-09-06T00:00:00.000Z'),
  consumedAt: null,
  invalidatedAt: null,
  createdAt: now,
  updatedAt: now,
};

function users(found: User | null = null): IUserRepository {
  return {
    findById: vi.fn(async () => found),
    findAll: vi.fn(async () => found ? [found] : []),
    save: vi.fn(async () => user),
    delete: vi.fn(async () => true),
    findByPhoneNumber: vi.fn(async () => found),
    upsert: vi.fn(async () => user),
  };
}

function sessions(): IUserSessionRepository {
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

function challenges(current: OtpChallenge | null = challenge): IOtpChallengeRepository {
  return {
    create: vi.fn(async () => challenge),
    findForVerification: vi.fn(async () => current),
    findLatestByPhone: vi.fn(async () => null),
    countCreatedSince: vi.fn(async () => 0),
    recordFailedAttempt: vi.fn(async () => current ? { ...current, attemptCount: current.attemptCount + 1 } : null),
    tryConsume: vi.fn(async () => true),
    invalidate: vi.fn(async () => undefined),
  };
}

function refreshTokens(rotation: RefreshRotationResult = { status: 'INVALID' }): IRefreshTokenRepository {
  return {
    issue: vi.fn(async () => undefined),
    rotate: vi.fn(async (): Promise<RefreshRotationResult> => rotation),
    revokeSession: vi.fn(async () => undefined),
    revokeAllForUser: vi.fn(async () => undefined),
  };
}

function security(): IAuthSecurityProvider {
  return {
    generateOtp: vi.fn(() => '654321'),
    hashSecret: vi.fn(async (secret) => `hash:${secret}`),
    verifySecret: vi.fn(async (secret, encoded) => encoded === `hash:${secret}`),
    generateRefreshToken: vi.fn(() => 'raw-refresh-token-with-enough-entropy-material'),
    hashRefreshToken: vi.fn((token) => `sha256:${token}`),
    generateTokenFamilyId: vi.fn(() => 'family-1'),
  };
}

const delivery = (): IOtpDeliveryProvider => ({
  sendOtp: vi.fn(async () => ({ success: true, providerReference: 'provider-1' })),
});

describe('Identity authentication use cases', () => {
  it('reports new/existing users without disclosing OTP material', async () => {
    const userRepository = users(null);
    const otpRepository = challenges();
    const otpDelivery = delivery();
    const useCase = new SendOtpUseCase(userRepository, otpRepository, otpDelivery, security());

    const first = await useCase.execute({ phoneNumber: '9999999999', deviceId: 'device-1' });
    expect(first).toMatchObject({
      challengeId: challenge.publicId,
      isNewUser: true,
      nextScreen: { template: 'form_template', api: 'auth/auth_otp' },
    });
    expect(first).not.toHaveProperty('mockOtp');
    expect(first).not.toHaveProperty('otp');

    vi.mocked(userRepository.findByPhoneNumber).mockResolvedValue(user);
    await expect(useCase.execute({ phoneNumber: '9999999999', deviceId: 'device-1' }))
      .resolves.toMatchObject({ isNewUser: false });
  });

  it('rejects an invalid OTP before creating identity/session/token state', async () => {
    const userRepository = users(null);
    const sessionRepository = sessions();
    const refreshRepository = refreshTokens();
    const otpRepository = challenges();
    const useCase = new VerifyOtpUseCase(
      userRepository,
      sessionRepository,
      otpRepository,
      refreshRepository,
      security(),
    );

    await expect(useCase.execute({
      challengeId: challenge.publicId,
      phoneNumber: '9999999999',
      otp: '000000',
      deviceId: 'device-1',
    })).rejects.toBeInstanceOf(UnauthorizedError);
    expect(userRepository.upsert).not.toHaveBeenCalled();
    expect(sessionRepository.upsert).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
    expect(otpRepository.recordFailedAttempt).toHaveBeenCalledWith(challenge.id, challenge.maxAttempts);
  });

  it('consumes a valid challenge and creates a hashed refresh-token family', async () => {
    const userRepository = users(null);
    const sessionRepository = sessions();
    const otpRepository = challenges();
    const refreshRepository = refreshTokens();
    vi.mocked(userRepository.upsert).mockResolvedValue(user);
    vi.mocked(sessionRepository.upsert).mockResolvedValue(session);
    const authSecurity = security();
    const useCase = new VerifyOtpUseCase(
      userRepository,
      sessionRepository,
      otpRepository,
      refreshRepository,
      authSecurity,
    );

    const result = await useCase.execute({
      challengeId: challenge.publicId,
      phoneNumber: '9999999999',
      otp: '654321',
      deviceId: 'device-1',
      deviceModel: 'Pixel',
      osVersion: '16',
      fcmToken: 'fcm-1',
    });

    expect(result).toMatchObject({ user, session, nextScreen: { template: 'dashboard_template', api: 'home' } });
    expect(result.refreshToken).toBe('raw-refresh-token-with-enough-entropy-material');
    expect(otpRepository.tryConsume).toHaveBeenCalledWith(challenge.id, expect.any(Date), challenge.maxAttempts);
    expect(refreshRepository.issue).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: session.id,
      tokenHash: 'sha256:raw-refresh-token-with-enough-entropy-material',
      familyId: 'family-1',
    }));
    expect(sessionRepository.upsert).toHaveBeenCalledWith(7, 'device-1', expect.objectContaining({
      deviceModel: 'Pixel', osVersion: '16', fcmToken: 'fcm-1',
    }));
  });

  it('creates a guest user and device session', async () => {
    const userRepository = users();
    const sessionRepository = sessions();
    vi.mocked(userRepository.upsert).mockResolvedValue(guest);
    vi.mocked(sessionRepository.upsert).mockResolvedValue({ ...session, userId: 8, user: guest });
    const useCase = new GuestLoginUseCase(userRepository, sessionRepository);

    const result = await useCase.execute({ deviceId: 'guest-device', deviceModel: 'Web', osVersion: '1', fcmToken: 'guest-fcm' });

    expect(result.user).toBe(guest);
    expect(userRepository.upsert).toHaveBeenCalledWith(expect.stringMatching(/^guest_/), { isGuest: true, role: 'GUEST' });
    expect(sessionRepository.upsert).toHaveBeenCalledWith(8, 'guest-device', {
      deviceModel: 'Web', osVersion: '1', fcmToken: 'guest-fcm',
    });
  });

  it('rejects missing refresh-token records', async () => {
    const refreshRepository = refreshTokens({ status: 'INVALID' });
    await expect(new RefreshTokenUseCase(refreshRepository, security()).execute({
      refreshToken: 'missing-refresh-token-material-1234567890',
      deviceId: 'device-1',
    })).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rotates a valid refresh token and returns the owning user with a new raw token', async () => {
    const refreshRepository = refreshTokens({ status: 'ROTATED', session });
    const result = await new RefreshTokenUseCase(refreshRepository, security()).execute({
      refreshToken: 'old-refresh-token-material-123456789012345',
      deviceId: 'device-1',
    });

    expect(result.user).toBe(user);
    expect(result.session).toBe(session);
    expect(result.refreshToken).toBe('raw-refresh-token-with-enough-entropy-material');
    expect(refreshRepository.rotate).toHaveBeenCalledWith(expect.objectContaining({
      currentTokenHash: 'sha256:old-refresh-token-material-123456789012345',
      replacementTokenHash: 'sha256:raw-refresh-token-with-enough-entropy-material',
    }));
  });

  it('delegates one-session and all-session logout to refresh-token revocation', async () => {
    const refreshRepository = refreshTokens();
    const useCase = new LogoutUseCase(refreshRepository);

    await useCase.execute({ sessionId: 11 });
    await useCase.execute({ logoutAll: true, userId: 7 });
    await useCase.execute({ logoutAll: true });
    await useCase.execute({});

    expect(refreshRepository.revokeSession).toHaveBeenCalledWith(11, expect.any(Date));
    expect(refreshRepository.revokeAllForUser).toHaveBeenCalledWith(7, expect.any(Date));
    expect(refreshRepository.revokeSession).toHaveBeenCalledTimes(1);
    expect(refreshRepository.revokeAllForUser).toHaveBeenCalledTimes(1);
  });
});
