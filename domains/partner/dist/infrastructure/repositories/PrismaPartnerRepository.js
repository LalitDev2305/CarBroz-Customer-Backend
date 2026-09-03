export class PrismaPartnerRepository {
    prismaClient;
    unitOfWorkPrisma = null;
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaClient;
    }
    setUnitOfWork(uow) {
        this.unitOfWorkPrisma = uow;
    }
    mapToDomain(entity) {
        return new Partner(entity);
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