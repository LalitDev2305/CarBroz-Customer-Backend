export class PrismaPartnerRepository {
    prismaProvider;
    unitOfWorkPrisma = null;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaProvider.getClient();
    }
    setUnitOfWork(uow) {
        this.unitOfWorkPrisma = uow;
    }
    mapToDomain(entity) {
        return {
            id: entity.id,
            publicId: entity.publicId,
            businessName: entity.businessName,
            type: entity.type,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt
        };
    }
    async findByPublicId(publicId) {
        const entity = await this.prisma.partner.findUnique({
            where: { publicId }
        });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findById(id) {
        const entity = await this.prisma.partner.findUnique({
            where: { id }
        });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.prisma.partner.findMany();
        return entities.map((e) => this.mapToDomain(e));
    }
    async save(entity) {
        throw new Error('Method not implemented.');
    }
    async create(data) {
        const entity = await this.prisma.partner.create({
            data: {
                businessName: data.businessName,
                type: data.type,
                status: data.status
            }
        });
        return this.mapToDomain(entity);
    }
    async update(id, data) {
        const entity = await this.prisma.partner.update({
            where: { id },
            data: {
                status: data.status,
                type: data.type,
                businessName: data.businessName
            }
        });
        return this.mapToDomain(entity);
    }
    async delete(id) {
        await this.prisma.partner.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return true;
    }
}
//# sourceMappingURL=PrismaPartnerRepository.js.map