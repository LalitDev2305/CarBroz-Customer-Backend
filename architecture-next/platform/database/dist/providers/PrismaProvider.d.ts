import { PrismaClient } from '@prisma/client';
export declare class PrismaProvider {
    private static instance;
    static getInstance(): PrismaClient;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    health(): Promise<boolean>;
    getClient(): PrismaClient;
}
//# sourceMappingURL=PrismaProvider.d.ts.map