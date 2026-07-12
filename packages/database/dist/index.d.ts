import { PrismaClient } from '@prisma/client';
export declare const getPrismaClient: () => PrismaClient;
export declare const checkDatabaseHealth: () => Promise<boolean>;
export declare const disconnectDatabase: () => Promise<void>;
export { PrismaClient } from '@prisma/client';
