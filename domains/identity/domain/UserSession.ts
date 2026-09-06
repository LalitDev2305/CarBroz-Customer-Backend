import { User } from './User.js';

/** UserSession is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface UserSession {
  id: number;
  publicId: string;
  userId: number;
  deviceId: string;
  deviceModel: string | null;
  osVersion: string | null;
  fcmToken: string | null;
  refreshToken: string | null;
  isRevoked: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user?: User;
}
