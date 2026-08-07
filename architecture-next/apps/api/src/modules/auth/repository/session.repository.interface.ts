import { DeviceSession, RefreshSession } from '../domain/user-identity.entity.js';

export interface ISessionRepository {
  // Device Sessions
  createDeviceSession(session: Partial<DeviceSession>): Promise<DeviceSession>;
  findDeviceSessionById(id: string): Promise<DeviceSession | null>;
  findDeviceSessionsByUserId(userId: string): Promise<DeviceSession[]>;
  updateDeviceSession(id: string, data: Partial<DeviceSession>): Promise<DeviceSession>;
  deleteDeviceSession(id: string): Promise<void>;
  deleteAllDeviceSessions(userId: string): Promise<void>;

  // Refresh Sessions
  createRefreshSession(session: Partial<RefreshSession>): Promise<RefreshSession>;
  findRefreshSessionByTokenHash(hash: string): Promise<RefreshSession | null>;
  revokeRefreshSession(id: string): Promise<void>;
  revokeAllRefreshSessionsForUser(userId: string): Promise<void>;
}
