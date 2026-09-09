import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@carbroz/foundation-kernel';
import type { OtpChallenge } from '../domain/OtpChallenge.js';
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { IUserSessionRepository } from '../domain/repositories/IUserSessionRepository.js';
import type { IOtpChallengeRepository } from '../domain/repositories/IOtpChallengeRepository.js';
import type { IRefreshTokenRepository } from '../domain/repositories/IRefreshTokenRepository.js';
import type { IAuthSecurityProvider } from './ports/IAuthSecurityProvider.js';
import { VerifyOtpUseCase } from './AuthUseCases.js';

const phoneNumber = '9999999999';
const deviceId = 'device-1';
const baseChallenge: OtpChallenge = {
  id: 41,
  publicId: '44444444-4444-4444-8444-444444444444',
  phoneNumber,
  deviceId,
  otpHash: 'hash:654321',
  attemptCount: 0,
  maxAttempts: 5,
  expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  consumedAt: null,
  invalidatedAt: null,
  createdAt: new Date('2026-09-09T00:00:00.000Z'),
  updatedAt: new Date('2026-09-09T00:00:00.000Z'),
};

const user = {
  id: 7,
  publicId: 'user-7',
  email: null,
  phoneNumber,
  role: 'USER',
  isGuest: false,
  createdAt: new Date('2026-09-09T00:00:00.000Z'),
  updatedAt: new Date('2026-09-09T00:00:00.000Z'),
  deletedAt: null,
};

const session = {
  id: 9,
  publicId: 'session-9',
  userId: user.id,
  deviceId,
  deviceModel: null,
  osVersion: null,
  fcmToken: null,
  isRevoked: false,
  lastActiveAt: new Date('2026-09-09T00:00:00.000Z'),
  createdAt: new Date('2026-09-09T00:00:00.000Z'),
  updatedAt: new Date('2026-09-09T00:00:00.000Z'),
  deletedAt: null,
  user,
};

function users(): IUserRepository {
  return {
    findById: vi.fn(async () => user),
    findAll: vi.fn(async () => [user]),
    save: vi.fn(async () => user),
    delete: vi.fn(async () => true),
    findByPhoneNumber: vi.fn(async () => user),
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

function challenges(current: OtpChallenge | null = baseChallenge): IOtpChallengeRepository {
  return {
    create: vi.fn(async () => baseChallenge),
    tryCreateWithinRateLimit: vi.fn(async () => baseChallenge),
    findForVerification: vi.fn(async () => current),
    findLatestByPhone: vi.fn(async () => current),
    countCreatedSince: vi.fn(async () => 0),
    recordFailedAttempt: vi.fn(async () => current ? { ...current, attemptCount: current.attemptCount + 1 } : null),
    tryConsume: vi.fn(async () => true),
    invalidate: vi.fn(async () => undefined),
  };
}

function refreshTokens(): IRefreshTokenRepository {
  return {
    issue: vi.fn(async () => undefined),
    rotate: vi.fn(async () => ({ status: 'INVALID' as const })),
    revokeSession: vi.fn(async () => undefined),
    revokeAllForUser: vi.fn(async () => undefined),
  };
}

function security(matches = true): IAuthSecurityProvider {
  return {
    generateOtp: vi.fn(() => '654321'),
    hashSecret: vi.fn(async (secret) => `hash:${secret}`),
    verifySecret: vi.fn(async () => matches),
    generateRefreshToken: vi.fn(() => 'raw-refresh-token-with-enough-entropy-material'),
    hashRefreshToken: vi.fn((token) => `sha256:${token}`),
    generateTokenFamilyId: vi.fn(() => 'family-1'),
  };
}

function createUseCase(
  otpRepository: IOtpChallengeRepository,
  authSecurity: IAuthSecurityProvider = security(),
) {
  const userRepository = users();
  const sessionRepository = sessions();
  const refreshRepository = refreshTokens();
  return {
    useCase: new VerifyOtpUseCase(userRepository, sessionRepository, otpRepository, refreshRepository, authSecurity),
    userRepository,
    sessionRepository,
    refreshRepository,
  };
}

const input = {
  challengeId: baseChallenge.publicId,
  phoneNumber,
  otp: '654321',
  deviceId,
};

describe('VerifyOtpUseCase security regressions', () => {
  it.each(['missing challenge', 'phone mismatch', 'device mismatch'])(
    'rejects %s before identity/session/token creation',
    async () => {
      const repository = challenges(null);
      const { useCase, userRepository, sessionRepository, refreshRepository } = createUseCase(repository);

      await expect(useCase.execute(input)).rejects.toBeInstanceOf(UnauthorizedError);
      expect(userRepository.upsert).not.toHaveBeenCalled();
      expect(sessionRepository.upsert).not.toHaveBeenCalled();
      expect(refreshRepository.issue).not.toHaveBeenCalled();
      expect(repository.tryConsume).not.toHaveBeenCalled();
    },
  );

  it('rejects an expired challenge before secret verification or consume', async () => {
    const repository = challenges({ ...baseChallenge, expiresAt: new Date('2020-01-01T00:00:00.000Z') });
    const authSecurity = security();
    const { useCase, refreshRepository } = createUseCase(repository, authSecurity);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(authSecurity.verifySecret).not.toHaveBeenCalled();
    expect(repository.tryConsume).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
  });

  it('rejects a challenge already at max attempts', async () => {
    const repository = challenges({ ...baseChallenge, attemptCount: baseChallenge.maxAttempts });
    const { useCase, refreshRepository } = createUseCase(repository);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(repository.recordFailedAttempt).not.toHaveBeenCalled();
    expect(repository.tryConsume).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
  });

  it('increments a failed attempt and invalidates when the maximum is reached', async () => {
    const almostExhausted = { ...baseChallenge, attemptCount: baseChallenge.maxAttempts - 1 };
    const repository = challenges(almostExhausted);
    vi.mocked(repository.recordFailedAttempt).mockResolvedValue({ ...almostExhausted, attemptCount: baseChallenge.maxAttempts });
    const { useCase, refreshRepository } = createUseCase(repository, security(false));

    await expect(useCase.execute({ ...input, otp: '000000' })).rejects.toBeInstanceOf(UnauthorizedError);
    expect(repository.recordFailedAttempt).toHaveBeenCalledWith(baseChallenge.id, baseChallenge.maxAttempts);
    expect(repository.invalidate).toHaveBeenCalledWith(baseChallenge.id, expect.any(Date));
    expect(repository.tryConsume).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
  });

  it('issues no identity/session/token when atomic consume loses a race', async () => {
    const repository = challenges();
    vi.mocked(repository.tryConsume).mockResolvedValue(false);
    const { useCase, userRepository, sessionRepository, refreshRepository } = createUseCase(repository);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(userRepository.upsert).not.toHaveBeenCalled();
    expect(sessionRepository.upsert).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
  });

  it('allows at most one concurrent verification to pass atomic consume', async () => {
    const repository = challenges();
    vi.mocked(repository.tryConsume).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { useCase, refreshRepository } = createUseCase(repository);

    const results = await Promise.allSettled([useCase.execute(input), useCase.execute(input)]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(refreshRepository.issue).toHaveBeenCalledTimes(1);
  });

  it('rejects replay of an already consumed challenge', async () => {
    const repository = challenges({ ...baseChallenge, consumedAt: new Date('2026-09-09T00:01:00.000Z') });
    const { useCase, refreshRepository } = createUseCase(repository);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(repository.tryConsume).not.toHaveBeenCalled();
    expect(refreshRepository.issue).not.toHaveBeenCalled();
  });

  it('returns the canonical authenticated destination only after successful consume and hashed refresh issuance', async () => {
    const repository = challenges();
    const authSecurity = security();
    const { useCase, refreshRepository } = createUseCase(repository, authSecurity);

    const result = await useCase.execute(input);

    expect(repository.tryConsume).toHaveBeenCalledWith(baseChallenge.id, expect.any(Date), baseChallenge.maxAttempts);
    expect(refreshRepository.issue).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: session.id,
      tokenHash: 'sha256:raw-refresh-token-with-enough-entropy-material',
      familyId: 'family-1',
    }));
    expect(result.nextScreen).toEqual({
      screenId: 'partner_dashboard',
      templateId: 'partner_dashboard_template',
      templateType: 'default_template',
      endpoint: '/api/v1/partner/sdui/registry/partner_dashboard',
      method: 'GET',
      authentication: 'SESSION',
    });
    expect(JSON.stringify(result)).not.toContain(baseChallenge.otpHash);
    expect(JSON.stringify(result)).not.toContain('654321');
  });
});
