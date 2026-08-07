export class PrismaPartnerProfileRepository {
    prismaProvider;
    unitOfWorkPrisma = null;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaProvider.getClient();
    }
    mapToDomain(entity) {
        return {
            id: entity.id,
            publicId: entity.publicId,
            partnerId: entity.partnerId,
            description: entity.description,
            logoUrl: entity.logoUrl,
            supportEmail: entity.supportEmail,
            supportPhone: entity.supportPhone,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
    async findByPartnerId(partnerId) {
        const model = await this.prisma.partnerProfile.findUnique({ where: { partnerId } });
        return model ? this.mapToDomain(model) : null;
    }
    async findByPublicId(publicId) {
        const model = await this.prisma.partnerProfile.findUnique({ where: { publicId } });
        return model ? this.mapToDomain(model) : null;
    }
    async save(profile) {
        const data = profile.toPersistence ? profile.toPersistence() : profile;
        const model = await this.prisma.partnerProfile.upsert({
            where: { partnerId: profile.partnerId },
            create: data,
            update: data,
        });
        return this.mapToDomain(model);
    }
    async update(partnerId, data) {
        const model = await this.prisma.partnerProfile.update({
            where: { partnerId },
            data,
        });
        return this.mapToDomain(model);
    }
    async delete(partnerId) {
        try {
            await this.prisma.partnerProfile.delete({ where: { partnerId } });
            return true;
        }
        catch {
            return false;
        }
    }
    setUnitOfWork(uow) {
        this.unitOfWorkPrisma = uow;
    }
}
//# sourceMappingURL=PrismaPartnerProfileRepository.js.map