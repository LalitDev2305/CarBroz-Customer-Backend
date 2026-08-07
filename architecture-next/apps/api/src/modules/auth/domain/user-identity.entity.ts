export interface UserIdentity {
  id: string;
  mobileNumber: string;
  roles: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceSession {
  id: string;
  userId: string;
  deviceId: string;
  platform: string;
  appVersion: string;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface RefreshSession {
  id: string;
  userId: string;
  deviceSessionId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}
