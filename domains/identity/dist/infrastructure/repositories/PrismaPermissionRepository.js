export class PrismaPermissionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const permission = await this.prisma.permission.findUnique({ where: { id } });
        if (!permission)
            return null;
        return this.mapToDomain(permission);
    }
    async findAll() {
        const permissions = await this.prisma.permission.findMany();
        return permissions.map(this.mapToDomain);
    }
    async findByKey(key) {
        const permission = await this.prisma.permission.findUnique({ where: { key } });
        if (!permission)
            return null;
        return this.mapToDomain(permission);
    }
    async save(entity) {
        const data = {
            key: entity.key,
            module: entity.module,
            description: entity.description
        };
        let permission;
        if (entity.id) {
            permission = await this.prisma.permission.update({
                where: { id: entity.id },
                data
            });
        }
        else {
            permission = await this.prisma.permission.create({
                data: {
                    ...data,
                    publicId: entity.publicId
                }
            });
        }
        return this.mapToDomain(permission);
    }
    async delete(id) {
        await this.prisma.permission.delete({ where: { id } });
        return true;
    }
    mapToDomain(permission) {
        return {
            id: permission.id,
            publicId: permission.publicId,
            key: permission.key,
            module: permission.module,
            description: permission.description,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
            deletedAt: permission.deletedAt
        };
    }
}
//# sourceMappingURL=PrismaPermissionRepository.js.map