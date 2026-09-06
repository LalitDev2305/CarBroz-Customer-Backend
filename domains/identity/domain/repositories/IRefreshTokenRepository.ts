import type { UserSession } from '../UserSession.js';

export type RefreshRotationStatus = 'ROTATED' | 'INVALID' | 'EXPIRED' | 'REUSED' | 'DEVICE_MISMATCH';

export interface IssueRefreshTokenInput {
  sessionId: number;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  now: Date;
}

export interface RotateRefreshTokenInput {
  currentTokenHash: string;
  deviceId: string;
  replacementTokenHash: string;
  replacementExpiresAt: Date;
  now: Date;
}

export interface RefreshRotationResult {
  status: RefreshRotationStatus;
  session?: UserSession;
}

export interface IRefreshTokenRepository {
  issue(input: IssueRefreshTokenInput): Promise<void>;
  rotate(input: RotateRefreshTokenInput): Promise<RefreshRotationResult>;
  revokeSession(sessionId: number, now: Date): Promise<void>;
  revokeAllForUser(userId: number, now: Date): Promise<void>;
}
