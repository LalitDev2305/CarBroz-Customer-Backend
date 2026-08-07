import { DeviceToken } from '../entities/DeviceToken.js';
export interface DeviceTokenRepository {
    findByUserId(userId: number): Promise<DeviceToken[]>;
    deactivate(userId: number, deviceId: string): Promise<void>;
    save(token: DeviceToken): Promise<DeviceToken>;
}
