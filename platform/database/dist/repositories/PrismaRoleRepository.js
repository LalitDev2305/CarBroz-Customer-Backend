export class PrismaRoleRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role)
            return null;
        return this.mapToDomain(role);
    }
    async findAll() {
        const roles = await this.prisma.role.findMany();
        return roles.map(this.mapToDomain);
    }
    async findByName(name) {
        const role = await this.prisma.role.findUnique({ where: { name } });
        if (!role)
            return null;
        return this.mapToDomain(role);
    }
    async findWithPermissions(roleId) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: { permissions: true }
        });
        if (!role)
            return null;
        return {
            ...this.mapToDomain(role),
            permissions: role.permissions.map(p => p.permissionId)
        };
    }
    async save(entity) {
        const data = {
            name: entity.name,
            description: entity.description,
            isSystem: entity.isSystem
        };
        let role;
        if (entity.id) {
            role = await this.prisma.role.update({
                where: { id: entity.id },
                data
            });
        }
        else {
            role = await this.prisma.role.create({
                data: {
                    ...data,
                    publicId: entity.publicId
                }
            });
        }
        return this.mapToDomain(role);
    }
    async delete(id) {
        await this.prisma.role.delete({ where: { id } });
        return true;
    }
    mapToDomain(role) {
        return {
            id: role.id,
            publicId: role.publicId,
            name: role.name,
            description: role.description,
            isSystem: role.isSystem,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            deletedAt: role.deletedAt
        };
    }
}
//# sourceMappingURL=PrismaRoleRepository.js.map