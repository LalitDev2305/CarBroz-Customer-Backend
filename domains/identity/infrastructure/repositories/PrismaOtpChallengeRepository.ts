import type { PrismaClient } from '@prisma/client';
import type { OtpChallenge } from '../../domain/OtpChallenge.js';
import type {
  CreateOtpChallengeInput,
  IOtpChallengeRepository,
  OtpChallengeRateLimitGuard,
} from '../../domain/repositories/IOtpChallengeRepository.js';

/** Prisma persistence adapter for Identity-owned OTP challenges. */
export class PrismaOtpChallengeRepository implements IOtpChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateOtpChallengeInput): Promise<OtpChallenge> {
    const challenge = await this.prisma.otpChallenge.create({
      data: {
        phoneNumber: input.phoneNumber,
        deviceId: input.deviceId,
        otpHash: input.otpHash,
        maxAttempts: input.maxAttempts,
        expiresAt: input.expiresAt,
      },
    });
    return this.mapToDomain(challenge);
  }

  async tryCreateWithinRateLimit(
    input: CreateOtpChallengeInput,
    guard: OtpChallengeRateLimitGuard,
  ): Promise<OtpChallenge | null> {
    return this.prisma.$transaction(async (tx) => {
      const recentChallenges = await tx.otpChallenge.count({
        where: {
          phoneNumber: input.phoneNumber,
          createdAt: { gte: guard.windowStart },
          invalidatedAt: null,
        },
      });
      if (recentChallenges >= guard.maxChallenges) return null;

      const challenge = await tx.otpChallenge.create({
        data: {
          phoneNumber: input.phoneNumber,
          deviceId: input.deviceId,
          otpHash: input.otpHash,
          maxAttempts: input.maxAttempts,
          expiresAt: input.expiresAt,
          createdAt: guard.now,
          updatedAt: guard.now,
        },
      });
      return this.mapToDomain(challenge);
    });
  }

  async findForVerification(publicId: string, phoneNumber: string, deviceId: string): Promise<OtpChallenge | null> {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { publicId, phoneNumber, deviceId },
    });
    return challenge ? this.mapToDomain(challenge) : null;
  }

  async findLatestByPhone(phoneNumber: string): Promise<OtpChallenge | null> {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phoneNumber },
      orderBy: { createdAt: 'desc' },
    });
    return challenge ? this.mapToDomain(challenge) : null;
  }

  async countCreatedSince(phoneNumber: string, since: Date): Promise<number> {
    return this.prisma.otpChallenge.count({
      where: {
        phoneNumber,
        createdAt: { gte: since },
        invalidatedAt: null,
      },
    });
  }

  async recordFailedAttempt(id: number, maxAttempts: number): Promise<OtpChallenge | null> {
    const update = await this.prisma.otpChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        invalidatedAt: null,
        attemptCount: { lt: maxAttempts },
      },
      data: { attemptCount: { increment: 1 } },
    });
    if (update.count !== 1) return null;

    const challenge = await this.prisma.otpChallenge.findUnique({ where: { id } });
    return challenge ? this.mapToDomain(challenge) : null;
  }

  async tryConsume(id: number, now: Date, maxAttempts: number): Promise<boolean> {
    const update = await this.prisma.otpChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        invalidatedAt: null,
        expiresAt: { gt: now },
        attemptCount: { lt: maxAttempts },
      },
      data: { consumedAt: now },
    });
    return update.count === 1;
  }

  async invalidate(id: number, now: Date): Promise<void> {
    await this.prisma.otpChallenge.updateMany({
      where: { id, consumedAt: null, invalidatedAt: null },
      data: { invalidatedAt: now },
    });
  }

  private mapToDomain(challenge: any): OtpChallenge {
    return {
      id: challenge.id,
      publicId: challenge.publicId,
      phoneNumber: challenge.phoneNumber,
      deviceId: challenge.deviceId,
      otpHash: challenge.otpHash,
      attemptCount: challenge.attemptCount,
      maxAttempts: challenge.maxAttempts,
      expiresAt: challenge.expiresAt,
      consumedAt: challenge.consumedAt,
      invalidatedAt: challenge.invalidatedAt,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };
  }
}
