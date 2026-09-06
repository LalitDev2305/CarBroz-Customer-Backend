export interface OtpChallenge {
  id: number;
  publicId: string;
  phoneNumber: string;
  deviceId: string;
  otpHash: string;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  invalidatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
