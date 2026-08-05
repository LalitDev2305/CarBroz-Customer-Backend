import { DeviceToken } from '../DeviceToken.js';

export interface IDeviceTokenRepository {
  upsert(token: DeviceToken): Promise<DeviceToken>;
  findByToken(token: string): Promise<DeviceToken | null>;
  listActiveByUserId(userId: number): Promise<DeviceToken[]>;
  deactivate(userId: number, deviceId: string): Promise<void>;
}
