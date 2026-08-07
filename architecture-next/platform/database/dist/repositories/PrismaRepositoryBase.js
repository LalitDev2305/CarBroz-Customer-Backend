export class PrismaRepositoryBase {
    prismaProvider;
    delegate;
    constructor(prismaProvider, delegate) {
        this.prismaProvider = prismaProvider;
        this.delegate = delegate;
    }
    async findById(id) {
        const record = await this.delegate.findUnique(this.buildFindUniqueArgs(id));
        return record ? this.mapToDomain(record) : null;
    }
    async findAll() {
        const records = await this.delegate.findMany();
        return records.map(this.mapToDomain.bind(this));
    }
    async findMany(params) {
        const records = await this.delegate.findMany(params);
        return records.map(this.mapToDomain.bind(this));
    }
    async create(entity) {
        const model = this.mapToModel(entity);
        const record = await this.delegate.create(this.buildCreateArgs(model));
        return this.mapToDomain(record);
    }
    async update(entity) {
        const model = this.mapToModel(entity);
        const record = await this.delegate.update(this.buildUpdateArgs(model));
        return this.mapToDomain(record);
    }
    async delete(id) {
        const record = await this.delegate.update(this.buildSoftDeleteArgs(id));
        return !!record;
    }
    async save(entity) {
        const id = this.getId(entity);
        if (id !== undefined && id !== null) {
            const exists = await this.exists(id);
            if (exists) {
                return this.update(entity);
            }
        }
        return this.create(entity);
    }
    async exists(id) {
        const record = await this.delegate.findUnique(this.buildExistsArgs(id));
        return !!record;
    }
}
//# sourceMappingURL=PrismaRepositoryBase.js.map