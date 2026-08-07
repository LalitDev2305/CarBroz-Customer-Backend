import { PrismaClient } from '@prisma/client';
import { DeviceToken, IDeviceTokenRepository } from '@carbroz/foundation-kernel';
export declare class PrismaDeviceTokenRepository implements IDeviceTokenRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    upsert(token: DeviceToken): Promise<DeviceToken>;
    findByToken(token: string): Promise<DeviceToken | null>;
    listActiveByUserId(userId: number): Promise<DeviceToken[]>;
    deactivate(userId: number, deviceId: string): Promise<void>;
}
//# sourceMappingURL=PrismaDeviceTokenRepository.d.ts.map