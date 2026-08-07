import { PrismaRepositoryBase } from './PrismaRepositoryBase.js';
export class PrismaConfigRepository extends PrismaRepositoryBase {
    constructor(prismaProvider) {
        super(prismaProvider, prismaProvider.getClient().systemConfig);
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
    mapToModel(entity) {
        return {
            id: entity.id,
            publicId: entity.publicId,
            key: entity.key,
            value: entity.value,
            description: entity.description,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
        };
    }
    getId(entity) {
        return entity.id;
    }
    buildFindUniqueArgs(id) {
        return { where: { id } };
    }
    buildCreateArgs(model) {
        return { data: model };
    }
    buildUpdateArgs(model) {
        return {
            where: { id: model.id },
            data: model,
        };
    }
    buildSoftDeleteArgs(id) {
        return {
            where: { id },
            data: { deletedAt: new Date() },
        };
    }
    buildExistsArgs(id) {
        return {
            where: { id },
            select: { id: true },
        };
    }
    async findByKey(key) {
        const model = await this.delegate.findUnique({
            where: { key, deletedAt: null },
        });
        return model ? this.mapToDomain(model) : null;
    }
    async findAllConfig() {
        const models = await this.delegate.findMany({
            where: { deletedAt: null },
        });
        return models.map((m) => this.mapToDomain(m));
    }
}
//# sourceMappingURL=PrismaConfigRepository.js.map