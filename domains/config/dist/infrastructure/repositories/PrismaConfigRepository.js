export class PrismaConfigRepository {
    prismaClient;
    unitOfWorkPrisma = null;
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaClient;
    }
    mapToDomain(model) {
        return {
            id: model.id,
            publicId: model.publicId,
            key: model.key,
            value: model.value,
            description: model.description,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
            deletedAt: model.deletedAt,
        };
    }
    async findById(id) {
        const model = await this.prisma.systemConfig.findUnique({ where: { id } });
        return model ? this.mapToDomain(model) : null;
    }
    async findAll() {
        const models = await this.prisma.systemConfig.findMany({ where: { deletedAt: null } });
        return models.map((m) => this.mapToDomain(m));
    }
    async save(entity) {
        const model = await this.prisma.systemConfig.upsert({
            where: { id: entity.id || 0 },
            create: {
                publicId: entity.publicId,
                key: entity.key,
                value: entity.value,
                description: entity.description,
            },
            update: {
                key: entity.key,
                value: entity.value,
                description: entity.description,
            },
        });
        return this.mapToDomain(model);
    }
    async delete(id) {
        await this.prisma.systemConfig.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return true;
    }
    async findByKey(key) {
        const model = await this.prisma.systemConfig.findFirst({
            where: { key, deletedAt: null },
        });
        return model ? this.mapToDomain(model) : null;
    }
    async findAllConfig() {
        const models = await this.prisma.systemConfig.findMany({
            where: { deletedAt: null },
        });
        return models.map((m) => this.mapToDomain(m));
    }
}
//# sourceMappingURL=PrismaConfigRepository.js.map