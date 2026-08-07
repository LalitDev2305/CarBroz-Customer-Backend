export class PrismaUserSessionRepository {
    prisma;
    constructor(prismaProvider) {
        this.prisma = prismaProvider.getClient();
    }
    async findById(id) {
        const session = await this.prisma.userSession.findUnique({
            where: { id, deletedAt: null },
            include: { user: true }
        });
        return session ? this.mapToDomain(session) : null;
    }
    async findAll() {
        const sessions = await this.prisma.userSession.findMany({
            where: { deletedAt: null },
            include: { user: true }
        });
        return sessions.map(this.mapToDomain);
    }
    async create(data) {
        const session = await this.prisma.userSession.create({
            data: {
                userId: data.userId,
                deviceId: data.deviceId,
                deviceModel: data.deviceModel,
                osVersion: data.osVersion,
                fcmToken: data.fcmToken,
                refreshToken: data.refreshToken,
            },
            include: { user: true }
        });
        return this.mapToDomain(session);
    }
    async update(id, data) {
        const session = await this.prisma.userSession.update({
            where: { id },
            data: {
                deviceModel: data.deviceModel,
                osVersion: data.osVersion,
                fcmToken: data.fcmToken,
                refreshToken: data.refreshToken,
                isRevoked: data.isRevoked,
                lastActiveAt: data.lastActiveAt,
            },
            include: { user: true }
        });
        return this.mapToDomain(session);
    }
    async save(entity) {
        if (entity.id) {
            return this.update(entity.id, entity);
        }
        return this.create(entity);
    }
    async delete(id) {
        try {
            await this.prisma.userSession.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async findByDevice(userId, deviceId) {
        const session = await this.prisma.userSession.findUnique({
            where: {
                userId_deviceId: { userId, deviceId },
            },
            include: { user: true }
        });
        if (!session || session.deletedAt)
            return null;
        return this.mapToDomain(session);
    }
    async findByRefreshToken(refreshToken, deviceId) {
        const session = await this.prisma.userSession.findFirst({
            where: {
                refreshToken,
                deviceId,
                isRevoked: false,
                deletedAt: null
            },
            include: { user: true }
        });
        return session ? this.mapToDomain(session) : null;
    }
    async upsert(userId, deviceId, data) {
        const session = await this.prisma.userSession.upsert({
            where: {
                userId_deviceId: { userId, deviceId }
            },
            update: {
                deviceModel: data.deviceModel,
                osVersion: data.osVersion,
                fcmToken: data.fcmToken,
                refreshToken: data.refreshToken,
                lastActiveAt: new Date(),
                isRevoked: false
            },
            create: {
                userId,
                deviceId,
                deviceModel: data.deviceModel,
                osVersion: data.osVersion,
                fcmToken: data.fcmToken,
                refreshToken: data.refreshToken,
            },
            include: { user: true }
        });
        return this.mapToDomain(session);
    }
    async revokeAllForUser(userId) {
        await this.prisma.userSession.updateMany({
            where: { userId },
            data: { isRevoked: true, refreshToken: null }
        });
    }
    mapToDomain(prismaSession) {
        return {
            id: prismaSession.id,
            publicId: prismaSession.publicId,
            userId: prismaSession.userId,
            deviceId: prismaSession.deviceId,
            deviceModel: prismaSession.deviceModel,
            osVersion: prismaSession.osVersion,
            fcmToken: prismaSession.fcmToken,
            refreshToken: prismaSession.refreshToken,
            isRevoked: prismaSession.isRevoked,
            lastActiveAt: prismaSession.lastActiveAt,
            createdAt: prismaSession.createdAt,
            updatedAt: prismaSession.updatedAt,
            deletedAt: prismaSession.deletedAt,
            user: prismaSession.user,
        };
    }
}
//# sourceMappingURL=PrismaUserSessionRepository.js.map