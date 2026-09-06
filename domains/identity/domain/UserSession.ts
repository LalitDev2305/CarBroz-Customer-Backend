import type { User } from './User.js';

/** Identity-owned authenticated or guest device session. Refresh-token material is never stored here. */
export interface UserSession {
  id: number;
  publicId: string;
  userId: number;
  deviceId: string;
  deviceModel: string | null;
  osVersion: string | null;
  fcmToken: string | null;
  isRevoked: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user?: User;
}
