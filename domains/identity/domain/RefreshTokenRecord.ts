export interface RefreshTokenRecord {
  id: number;
  publicId: string;
  sessionId: number;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  consumedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
