import { randomUUID } from 'node:crypto';
import type {
  CreateOtpChallengeInput,
  IOtpChallengeRepository,
  OtpChallenge,
  OtpChallengeRateLimitGuard,
} from '@carbroz/domain-identity';

/**
 * Deterministic process-local OTP repository used only when NODE_ENV=test.
 * Production composition remains Redis-only behind IOtpChallengeRepository.
 */
export class InMemoryOtpChallengeRepository implements IOtpChallengeRepository {
  private nextId = 1;
  private readonly challenges = new Map<number, OtpChallenge>();

  async create(input: CreateOtpChallengeInput): Promise<OtpChallenge> {
    return this.createAt(input, new Date());
  }

  async tryCreateWithinRateLimit(
    input: CreateOtpChallengeInput,
    guard: OtpChallengeRateLimitGuard,
  ): Promise<OtpChallenge | null> {
    const count = [...this.challenges.values()].filter((challenge) =>
      challenge.phoneNumber === input.phoneNumber
      && challenge.createdAt.getTime() >= guard.windowStart.getTime()
      && challenge.invalidatedAt === null,
    ).length;
    if (count >= guard.maxChallenges) return null;
    return this.createAt(input, guard.now);
  }

  async findForVerification(publicId: string, phoneNumber: string, deviceId: string): Promise<OtpChallenge | null> {
    return this.clone([...this.challenges.values()].find((challenge) =>
      challenge.publicId === publicId
      && challenge.phoneNumber === phoneNumber
      && challenge.deviceId === deviceId,
    ));
  }

  async findLatestByPhone(phoneNumber: string): Promise<OtpChallenge | null> {
    const latest = [...this.challenges.values()]
      .filter((challenge) => challenge.phoneNumber === phoneNumber)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
    return this.clone(latest);
  }

  async countCreatedSince(phoneNumber: string, since: Date): Promise<number> {
    return [...this.challenges.values()].filter((challenge) =>
      challenge.phoneNumber === phoneNumber
      && challenge.createdAt.getTime() >= since.getTime()
      && challenge.invalidatedAt === null,
    ).length;
  }

  async recordFailedAttempt(id: number, maxAttempts: number): Promise<OtpChallenge | null> {
    const challenge = this.challenges.get(id);
    if (!challenge || challenge.consumedAt || challenge.invalidatedAt || challenge.attemptCount >= maxAttempts) return null;
    const updated = { ...challenge, attemptCount: challenge.attemptCount + 1, updatedAt: new Date() };
    this.challenges.set(id, updated);
    return this.clone(updated);
  }

  async tryConsume(id: number, now: Date, maxAttempts: number): Promise<boolean> {
    const challenge = this.challenges.get(id);
    if (
      !challenge
      || challenge.consumedAt
      || challenge.invalidatedAt
      || challenge.expiresAt.getTime() <= now.getTime()
      || challenge.attemptCount >= maxAttempts
    ) return false;
    this.challenges.set(id, { ...challenge, consumedAt: now, updatedAt: now });
    return true;
  }

  async invalidate(id: number, now: Date): Promise<void> {
    const challenge = this.challenges.get(id);
    if (!challenge || challenge.consumedAt || challenge.invalidatedAt) return;
    this.challenges.set(id, { ...challenge, invalidatedAt: now, updatedAt: now });
  }

  private createAt(input: CreateOtpChallengeInput, now: Date): OtpChallenge {
    const challenge: OtpChallenge = {
      id: this.nextId++,
      publicId: randomUUID(),
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
    this.challenges.set(challenge.id, challenge);
    return this.clone(challenge)!;
  }

  private clone(challenge: OtpChallenge | undefined): OtpChallenge | null {
    return challenge ? { ...challenge } : null;
  }
}
