import { UserSession, IUserSessionRepository } from '@carbroz/common';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaUserSessionRepository implements IUserSessionRepository {
    private readonly prisma;
    constructor(prismaProvider: PrismaProvider);
    findById(id: number): Promise<UserSession | null>;
    findAll(): Promise<UserSession[]>;
    create(data: Partial<UserSession>): Promise<UserSession>;
    update(id: number, data: Partial<UserSession>): Promise<UserSession>;
    save(entity: UserSession): Promise<UserSession>;
    delete(id: number): Promise<boolean>;
    findByDevice(userId: number, deviceId: string): Promise<UserSession | null>;
    findByRefreshToken(refreshToken: string, deviceId: string): Promise<UserSession | null>;
    upsert(userId: number, deviceId: string, data: Partial<UserSession>): Promise<UserSession>;
    revokeAllForUser(userId: number): Promise<void>;
    private mapToDomain;
}
