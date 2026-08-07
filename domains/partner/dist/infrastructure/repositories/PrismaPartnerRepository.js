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
            deletedAt: entity.deletedAt,
        };
    }
    async findById(id) {
        const model = await this.prisma.partner.findUnique({ where: { id, deletedAt: null } });
        return model ? this.mapToDomain(model) : null;
    }
    async findByPublicId(publicId) {
        const model = await this.prisma.partner.findUnique({ where: { publicId, deletedAt: null } });
        return model ? this.mapToDomain(model) : null;
    }
    async findByCode(code) {
        const model = await this.prisma.partner.findUnique({ where: { code, deletedAt: null } });
        return model ? this.mapToDomain(model) : null;
    }
    async findAll() {
        const models = await this.prisma.partner.findMany({ where: { deletedAt: null } });
        return models.map((m) => this.mapToDomain(m));
    }
    async findByType(type) {
        const models = await this.prisma.partner.findMany({ where: { type, deletedAt: null } });
        return models.map((m) => this.mapToDomain(m));
    }
    async findByStatus(status) {
        const models = await this.prisma.partner.findMany({ where: { status, deletedAt: null } });
        return models.map((m) => this.mapToDomain(m));
    }
    async save(partner) {
        const data = partner.toPersistence ? partner.toPersistence() : partner;
        if (partner.id) {
            const updated = await this.prisma.partner.update({ where: { id: partner.id }, data });
            return this.mapToDomain(updated);
        }
        else {
            const created = await this.prisma.partner.create({ data });
            return this.mapToDomain(created);
        }
    }
    async updateStatus(id, status) {
        const updated = await this.prisma.partner.update({ where: { id }, data: { status } });
        return this.mapToDomain(updated);
    }
    async delete(id) {
        try {
            await this.prisma.partner.update({ where: { id }, data: { deletedAt: new Date() } });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=PrismaPartnerRepository.js.map