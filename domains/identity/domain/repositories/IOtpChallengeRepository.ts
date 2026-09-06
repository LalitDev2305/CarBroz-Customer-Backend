import type { OtpChallenge } from '../OtpChallenge.js';

export interface CreateOtpChallengeInput {
  phoneNumber: string;
  deviceId: string;
  otpHash: string;
  maxAttempts: number;
  expiresAt: Date;
}

export interface IOtpChallengeRepository {
  create(input: CreateOtpChallengeInput): Promise<OtpChallenge>;
  findForVerification(publicId: string, phoneNumber: string, deviceId: string): Promise<OtpChallenge | null>;
  findLatestByPhone(phoneNumber: string): Promise<OtpChallenge | null>;
  countCreatedSince(phoneNumber: string, since: Date): Promise<number>;
  recordFailedAttempt(id: number, maxAttempts: number): Promise<OtpChallenge | null>;
  tryConsume(id: number, now: Date, maxAttempts: number): Promise<boolean>;
  invalidate(id: number, now: Date): Promise<void>;
}
