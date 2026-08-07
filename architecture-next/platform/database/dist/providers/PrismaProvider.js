import { PrismaClient } from '@prisma/client';
export class PrismaProvider {
    static instance;
    static getInstance() {
        if (!PrismaProvider.instance) {
            PrismaProvider.instance = new PrismaClient();
        }
        return PrismaProvider.instance;
    }
    async connect() {
        await PrismaProvider.getInstance().$connect();
    }
    async disconnect() {
        await PrismaProvider.getInstance().$disconnect();
    }
    async health() {
        try {
            await PrismaProvider.getInstance().$queryRaw `SELECT 1`;
            return true;
        }
        catch (e) {
            return false;
        }
    }
    getClient() {
        return PrismaProvider.getInstance();
    }
}
//# sourceMappingURL=PrismaProvider.js.map