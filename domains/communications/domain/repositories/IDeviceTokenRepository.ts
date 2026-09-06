import { DeviceToken } from '../DeviceToken.js';

/** IDeviceTokenRepository is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IDeviceTokenRepository {
  upsert(token: DeviceToken): Promise<DeviceToken>;
  findByToken(token: string): Promise<DeviceToken | null>;
  listActiveByUserId(userId: number): Promise<DeviceToken[]>;
  deactivate(userId: number, deviceId: string): Promise<void>;
}
