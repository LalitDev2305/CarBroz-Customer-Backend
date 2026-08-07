import { Address } from '../../../domain/entities/Address.js';
export class PrismaAddressRepository {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.prismaProvider.getClient();
    }
    async findById(id) {
        const model = await this.prisma.address.findUnique({ where: { id, deletedAt: null } });
        return model ? new Address(model) : null;
    }
    async findByUserId(userId) {
        const models = await this.prisma.address.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        return models.map(m => new Address(m));
    }
    async findDefaultByUserId(userId) {
        const model = await this.prisma.address.findFirst({
            where: { userId, isDefault: true, deletedAt: null }
        });
        return model ? new Address(model) : null;
    }
    async findAll() {
        const models = await this.prisma.address.findMany({ where: { deletedAt: null } });
        return models.map(m => new Address(m));
    }
    async save(entity) {
        const data = {
            userId: entity.userId,
            label: entity.label,
            addressLine1: entity.addressLine1,
            addressLine2: entity.addressLine2,
            city: entity.city,
            state: entity.state,
            postalCode: entity.postalCode,
            country: entity.country,
            latitude: entity.latitude,
            longitude: entity.longitude,
            isDefault: entity.isDefault,
        };
        // Use transaction if setting as default to unset others
        return this.prisma.$transaction(async (tx) => {
            if (entity.isDefault) {
                await tx.address.updateMany({
                    where: { userId: entity.userId, deletedAt: null },
                    data: { isDefault: false }
                });
            }
            if (entity.id) {
                const updated = await tx.address.update({
                    where: { id: entity.id },
                    data,
                });
                return new Address(updated);
            }
            else {
                const created = await tx.address.create({
                    data,
                });
                return new Address(created);
            }
        });
    }
    async delete(id) {
        try {
            await this.prisma.address.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=PrismaAddressRepository.js.map