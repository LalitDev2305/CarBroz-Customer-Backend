export class PrismaUserRepository {
    prisma;
    constructor(prismaProvider) {
        this.prisma = prismaProvider.getClient();
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id, deletedAt: null }
        });
        return user ? this.mapToDomain(user) : null;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            where: { deletedAt: null }
        });
        return users.map(this.mapToDomain);
    }
    async create(data) {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                phoneNumber: data.phoneNumber,
                isGuest: data.isGuest ?? false,
                role: data.role ?? 'USER',
            }
        });
        return this.mapToDomain(user);
    }
    async update(id, data) {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                email: data.email,
                phoneNumber: data.phoneNumber,
                isGuest: data.isGuest,
                role: data.role,
            }
        });
        return this.mapToDomain(user);
    }
    async save(entity) {
        if (entity.id) {
            return this.update(entity.id, entity);
        }
        return this.create(entity);
    }
    async delete(id) {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async findByPhoneNumber(phoneNumber) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber, deletedAt: null }
        });
        return user ? this.mapToDomain(user) : null;
    }
    async upsert(phoneNumber, data) {
        const user = await this.prisma.user.upsert({
            where: { phoneNumber },
            update: {
                email: data.email,
                isGuest: data.isGuest,
                role: data.role,
            },
            create: {
                phoneNumber,
                email: data.email,
                isGuest: data.isGuest ?? false,
                role: data.role ?? 'USER',
            }
        });
        return this.mapToDomain(user);
    }
    mapToDomain(prismaUser) {
        return {
            id: prismaUser.id,
            publicId: prismaUser.publicId,
            email: prismaUser.email,
            phoneNumber: prismaUser.phoneNumber,
            isGuest: prismaUser.isGuest,
            role: prismaUser.role,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            deletedAt: prismaUser.deletedAt,
        };
    }
}
//# sourceMappingURL=PrismaUserRepository.js.map