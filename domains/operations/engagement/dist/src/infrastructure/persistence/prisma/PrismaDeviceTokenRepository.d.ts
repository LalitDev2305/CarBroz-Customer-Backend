import { PrismaProvider } from '@carbroz/platform-database';
import { DeviceToken } from '../../../domain/entities/DeviceToken.js';
export declare class PrismaDeviceTokenRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    upsert(token: DeviceToken): Promise<DeviceToken>;
    findByToken(token: string): Promise<DeviceToken | null>;
    listActiveByUserId(userId: number): Promise<DeviceToken[]>;
    deactivate(userId: number, deviceId: string): Promise<void>;
}
