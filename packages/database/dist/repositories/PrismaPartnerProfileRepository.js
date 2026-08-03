export class PrismaPartnerProfileRepository {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get client() {
        return this.prismaProvider.getClient();
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
    async findById(id) {
        const entity = await this.client.partnerProfile.findUnique({ where: { id } });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findByPartnerId(partnerId) {
        const entity = await this.client.partnerProfile.findUnique({ where: { partnerId } });
        return entity ? this.mapToDomain(entity) : null;
    }
    async create(profile) {
        const entity = await this.client.partnerProfile.create({
            data: {
                partnerId: profile.partnerId,
                description: profile.description,
                logoUrl: profile.logoUrl,
                supportEmail: profile.supportEmail,
                supportPhone: profile.supportPhone,
            },
        });
        return this.mapToDomain(entity);
    }
    async update(id, profile) {
        const entity = await this.client.partnerProfile.update({
            where: { id },
            data: {
                description: profile.description,
                logoUrl: profile.logoUrl,
                supportEmail: profile.supportEmail,
                supportPhone: profile.supportPhone,
            },
        });
        return this.mapToDomain(entity);
    }
    async delete(id) {
        try {
            await this.client.partnerProfile.delete({ where: { id } });
            return true;
        }
        catch (e) {
            if (e.code === 'P2025')
                return false; // Record not found
            throw e;
        }
    }
    async findAll() {
        const entities = await this.client.partnerProfile.findMany();
        return entities.map(e => this.mapToDomain(e));
    }
    async save(entity) {
        return this.update(entity.id, entity);
    }
}
//# sourceMappingURL=PrismaPartnerProfileRepository.js.map