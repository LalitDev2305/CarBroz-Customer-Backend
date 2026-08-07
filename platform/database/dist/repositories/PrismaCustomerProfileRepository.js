import { CustomerProfile } from '@carbroz/foundation-kernel';
export class PrismaCustomerProfileRepository {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.prismaProvider.getClient();
    }
    async findById(id) {
        const model = await this.prisma.customerProfile.findUnique({ where: { id, deletedAt: null } });
        return model ? new CustomerProfile(model) : null;
    }
    async findByUserId(userId) {
        const model = await this.prisma.customerProfile.findUnique({ where: { userId, deletedAt: null } });
        return model ? new CustomerProfile(model) : null;
    }
    async findAll() {
        const models = await this.prisma.customerProfile.findMany({ where: { deletedAt: null } });
        return models.map(m => new CustomerProfile(m));
    }
    async save(entity) {
        const data = {
            userId: entity.userId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            dateOfBirth: entity.dateOfBirth,
            gender: entity.gender,
            marketingOptIn: entity.marketingOptIn,
        };
        if (entity.id) {
            const updated = await this.prisma.customerProfile.update({
                where: { id: entity.id },
                data,
            });
            return new CustomerProfile(updated);
        }
        else {
            const created = await this.prisma.customerProfile.create({
                data,
            });
            return new CustomerProfile(created);
        }
    }
    async delete(id) {
        try {
            await this.prisma.customerProfile.update({
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
//# sourceMappingURL=PrismaCustomerProfileRepository.js.map