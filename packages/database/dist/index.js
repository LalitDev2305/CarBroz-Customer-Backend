import { PrismaClient } from '@prisma/client';
import { DatabaseConfig } from '@carbroz/config';
let prismaInstance = null;
export const getPrismaClient = () => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
            datasources: {
                db: {
                    url: DatabaseConfig.url,
                },
            },
        });
    }
    return prismaInstance;
};
export const checkDatabaseHealth = async () => {
    try {
        const prisma = getPrismaClient();
        await prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        return false;
    }
};
export const disconnectDatabase = async () => {
    if (prismaInstance) {
        await prismaInstance.$disconnect();
        prismaInstance = null;
    }
};
export { PrismaClient } from '@prisma/client';
//# sourceMappingURL=index.js.map