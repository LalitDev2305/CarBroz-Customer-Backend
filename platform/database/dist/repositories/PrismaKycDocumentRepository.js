export class PrismaKycDocumentRepository {
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
            type: entity.type,
            fileUrl: entity.fileUrl,
            status: entity.status,
            rejectionReason: entity.rejectionReason,
            uploadedById: entity.uploadedById,
            verifiedById: entity.verifiedById,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
    async findById(id) {
        const entity = await this.client.kycDocument.findUnique({ where: { id } });
        return entity ? this.mapToDomain(entity) : null;
    }
    async findByPartnerId(partnerId) {
        const entities = await this.client.kycDocument.findMany({ where: { partnerId } });
        return entities.map(e => this.mapToDomain(e));
    }
    async findByPartnerIdAndStatus(partnerId, status) {
        const entities = await this.client.kycDocument.findMany({ where: { partnerId, status } });
        return entities.map(e => this.mapToDomain(e));
    }
    async create(document) {
        const entity = await this.client.kycDocument.create({
            data: {
                partnerId: document.partnerId,
                type: document.type,
                fileUrl: document.fileUrl,
                status: document.status,
                rejectionReason: document.rejectionReason,
                uploadedById: document.uploadedById,
                verifiedById: document.verifiedById,
            },
        });
        return this.mapToDomain(entity);
    }
    async update(id, data) {
        const entity = await this.client.kycDocument.update({
            where: { id },
            data: {
                type: data.type,
                fileUrl: data.fileUrl,
                status: data.status,
                rejectionReason: data.rejectionReason,
                uploadedById: data.uploadedById,
                verifiedById: data.verifiedById,
            },
        });
        return this.mapToDomain(entity);
    }
    async updateStatus(id, status, verifiedById, rejectionReason) {
        const entity = await this.client.kycDocument.update({
            where: { id },
            data: {
                status,
                verifiedById,
                rejectionReason,
            },
        });
        return this.mapToDomain(entity);
    }
    async delete(id) {
        try {
            await this.client.kycDocument.delete({ where: { id } });
            return true;
        }
        catch (e) {
            if (e.code === 'P2025')
                return false;
            throw e;
        }
    }
    async findAll() {
        const entities = await this.client.kycDocument.findMany();
        return entities.map(e => this.mapToDomain(e));
    }
    async save(entity) {
        return this.update(entity.id, entity);
    }
}
//# sourceMappingURL=PrismaKycDocumentRepository.js.map