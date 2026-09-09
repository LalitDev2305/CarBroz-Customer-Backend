import { describe, expect, it, vi } from 'vitest';
import { ApplicationError } from '@carbroz/foundation-kernel';
import type { OtpChallenge } from '../domain/OtpChallenge.js';
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { IOtpChallengeRepository } from '../domain/repositories/IOtpChallengeRepository.js';
import type { IAuthSecurityProvider } from './ports/IAuthSecurityProvider.js';
import type { IOtpDeliveryProvider } from './ports/IOtpDeliveryProvider.js';
import { AUTH_SECURITY_POLICY } from './AuthSecurityPolicy.js';
import { SendOtpUseCase } from './AuthUseCases.js';

const phoneNumber = '9999999999';
const deviceId = 'device-1';
const challenge: OtpChallenge = {
  id: 21,
  publicId: '11111111-1111-4111-8111-111111111111',
  phoneNumber,
  deviceId,
  otpHash: 'hash:654321',
  attemptCount: 0,
  maxAttempts: AUTH_SECURITY_POLICY.otp.maxAttempts,
  expiresAt: new Date('2099-09-06T00:00:00.000Z'),
  consumedAt: null,
  invalidatedAt: null,
  createdAt: new Date('2026-09-09T12:00:00.000Z'),
  updatedAt: new Date('2026-09-09T12:00:00.000Z'),
};

function userRepository(): IUserRepository {
  return {
    findById: vi.fn(async () => null),
    findAll: vi.fn(async () => []),
    save: vi.fn(async () => { throw new Error('not used'); }),
    delete: vi.fn(async () => false),
    findByPhoneNumber: vi.fn(async () => null),
    upsert: vi.fn(async () => { throw new Error('not used'); }),
  };
}

function otpRepository(overrides: Partial<IOtpChallengeRepository> = {}): IOtpChallengeRepository {
  return {
    create: vi.fn(async () => challenge),
    tryCreateWithinRateLimit: vi.fn(async () => challenge),
    findForVerification: vi.fn(async () => null),
    findLatestByPhone: vi.fn(async () => null),
    countCreatedSince: vi.fn(async () => 0),
    recordFailedAttempt: vi.fn(async () => null),
    tryConsume: vi.fn(async () => false),
    invalidate: vi.fn(async () => undefined),
    ...overrides,
  };
}

function securityProvider(): IAuthSecurityProvider {
  return {
    generateOtp: vi.fn(() => '654321'),
    hashSecret: vi.fn(async (secret) => `hash:${secret}`),
    verifySecret: vi.fn(async () => false),
    generateRefreshToken: vi.fn(() => 'refresh-token'),
    hashRefreshToken: vi.fn((token) => `hash:${token}`),
    generateTokenFamilyId: vi.fn(() => 'family-1'),
  };
}

function deliveryProvider(result: { success: boolean; providerReference?: string } = { success: true, providerReference: 'provider-1' }): IOtpDeliveryProvider {
  return { sendOtp: vi.fn(async () => result) };
}

function useCase(repository: IOtpChallengeRepository, delivery: IOtpDeliveryProvider = deliveryProvider()): SendOtpUseCase {
  return new SendOtpUseCase(userRepository(), repository, delivery, securityProvider());
}

describe('SendOtpUseCase security regressions', () => {
  it('rejects an active resend cooldown before generating or delivering another OTP', async () => {
    const repository = otpRepository({
      findLatestByPhone: vi.fn(async () => ({ ...challenge, createdAt: new Date('2099-09-09T12:00:00.000Z') })),
    });
    const delivery = deliveryProvider();

    await expect(useCase(repository, delivery).execute({ phoneNumber, deviceId }))
      .rejects.toBeInstanceOf(ApplicationError);

    expect(repository.countCreatedSince).not.toHaveBeenCalled();
    expect(repository.tryCreateWithinRateLimit).not.toHaveBeenCalled();
    expect(delivery.sendOtp).not.toHaveBeenCalled();
  });

  it('rejects when the pre-check rate window is already exhausted', async () => {
    const repository = otpRepository({
      countCreatedSince: vi.fn(async () => AUTH_SECURITY_POLICY.otp.maxChallengesPerWindow),
    });
    const delivery = deliveryProvider();

    await expect(useCase(repository, delivery).execute({ phoneNumber, deviceId }))
      .rejects.toBeInstanceOf(ApplicationError);

    expect(repository.tryCreateWithinRateLimit).not.toHaveBeenCalled();
    expect(delivery.sendOtp).not.toHaveBeenCalled();
  });

  it('treats the atomic repository rate-limit decision as authoritative', async () => {
    const repository = otpRepository({ tryCreateWithinRateLimit: vi.fn(async () => null) });
    const delivery = deliveryProvider();

    await expect(useCase(repository, delivery).execute({ phoneNumber, deviceId }))
      .rejects.toBeInstanceOf(ApplicationError);

    expect(delivery.sendOtp).not.toHaveBeenCalled();
  });

  it('invalidates a persisted challenge when the provider reports delivery failure', async () => {
    const repository = otpRepository();
    const delivery = deliveryProvider({ success: false });

    await expect(useCase(repository, delivery).execute({ phoneNumber, deviceId }))
      .rejects.toBeInstanceOf(ApplicationError);

    expect(repository.invalidate).toHaveBeenCalledWith(challenge.id, expect.any(Date));
  });

  it('invalidates a persisted challenge and normalizes provider exceptions', async () => {
    const repository = otpRepository();
    const delivery: IOtpDeliveryProvider = {
      sendOtp: vi.fn(async () => { throw new Error('provider-internal-secret'); }),
    };

    await expect(useCase(repository, delivery).execute({ phoneNumber, deviceId }))
      .rejects.toMatchObject({ message: 'OTP delivery is temporarily unavailable' });

    expect(repository.invalidate).toHaveBeenCalledWith(challenge.id, expect.any(Date));
  });

  it('fails closed when OTP persistence is unavailable and never calls the delivery provider', async () => {
    const repository = otpRepository({
      tryCreateWithinRateLimit: vi.fn(async () => { throw new Error('redis unavailable'); }),
    });
    const delivery = deliveryProvider();

    await expect(useCase(repository, delivery).execute({ phoneNumber, deviceId }))
      .rejects.toThrow('redis unavailable');

    expect(delivery.sendOtp).not.toHaveBeenCalled();
  });

  it('returns only the canonical destination and never exposes OTP material', async () => {
    const result = await useCase(otpRepository()).execute({ phoneNumber, deviceId });
    const serialized = JSON.stringify(result);

    expect(result.nextScreen).toEqual({
      screenId: 'partner_otp',
      templateId: 'tpl_partner_otp_v1',
      templateType: 'form_template',
      endpoint: '/api/v1/partner/screen/auth_otp',
      method: 'GET',
      authentication: 'NONE',
    });
    expect(serialized).not.toContain('654321');
    expect(serialized).not.toContain('hash:654321');
    expect(result).not.toHaveProperty('otp');
    expect(result).not.toHaveProperty('mockOtp');
  });

  it('does not let concurrent send requests bypass the atomic repository rate limit', async () => {
    const atomicCreate = vi.fn()
      .mockResolvedValueOnce(challenge)
      .mockResolvedValueOnce(null);
    const repository = otpRepository({ tryCreateWithinRateLimit: atomicCreate });
    const delivery = deliveryProvider();
    const sendOtp = useCase(repository, delivery);

    const results = await Promise.allSettled([
      sendOtp.execute({ phoneNumber, deviceId }),
      sendOtp.execute({ phoneNumber, deviceId }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(delivery.sendOtp).toHaveBeenCalledTimes(1);
  });
});
