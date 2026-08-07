export class PrismaPartnerMemberRepository {
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
            userId: entity.userId,
            partnerId: entity.partnerId,
            role: entity.role,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }
    async findByPublicId(publicId) {
        const entity = await this.prisma.partnerMember.findUnique({
            where: { publicId }
        });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findByUserIdAndPartnerId(userId, partnerId) {
        const entity = await this.prisma.partnerMember.findUnique({
            where: {
                userId_partnerId: {
                    userId,
                    partnerId
                }
            }
        });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findByUserId(userId) {
        const entities = await this.prisma.partnerMember.findMany({
            where: { userId }
        });
        return entities.map((e) => this.mapToDomain(e));
    }
    async findByPartnerId(partnerId) {
        const entities = await this.prisma.partnerMember.findMany({
            where: { partnerId }
        });
        return entities.map((e) => this.mapToDomain(e));
    }
    async findById(id) {
        const entity = await this.prisma.partnerMember.findUnique({
            where: { id }
        });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.prisma.partnerMember.findMany();
        return entities.map((e) => this.mapToDomain(e));
    }
    async save(entity) {
        throw new Error('Method not implemented.');
    }
    async create(data) {
        const entity = await this.prisma.partnerMember.create({
            data: {
                userId: data.userId,
                partnerId: data.partnerId,
                role: data.role,
                status: data.status
            }
        });
        return this.mapToDomain(entity);
    }
    async delete(id) {
        await this.prisma.partnerMember.delete({
            where: { id }
        });
        return true;
    }
}
//# sourceMappingURL=PrismaPartnerMemberRepository.js.map