export class PrismaAdminRoleRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assignRole(userId, roleId, assignedBy) {
        const record = await this.prisma.adminUserRole.create({
            data: {
                userId,
                roleId,
                assignedBy
            }
        });
        return this.mapToDomain(record);
    }
    async removeRole(userId, roleId) {
        await this.prisma.adminUserRole.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId
                }
            }
        });
        return true;
    }
    async findRolesForUser(userId) {
        const records = await this.prisma.adminUserRole.findMany({
            where: { userId },
            select: { roleId: true }
        });
        return records.map(r => r.roleId);
    }
    mapToDomain(record) {
        return {
            userId: record.userId,
            roleId: record.roleId,
            assignedBy: record.assignedBy,
            assignedAt: record.assignedAt
        };
    }
}
//# sourceMappingURL=PrismaAdminRoleRepository.js.map