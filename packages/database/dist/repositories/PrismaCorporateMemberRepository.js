import { CorporateMember } from '@carbroz/common';
export class PrismaCorporateMemberRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new CorporateMember({
            id: record.id,
            publicId: record.publicId,
            corporateAccountId: record.corporateAccountId,
            userId: record.userId,
            role: record.role,
            status: record.status,
            monthlyCapPaise: record.monthlyCapPaise,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(member) {
        const record = await this.prisma.corporateMember.create({
            data: {
                corporateAccountId: member.corporateAccountId,
                userId: member.userId,
                role: member.role,
                status: member.status,
                monthlyCapPaise: member.monthlyCapPaise,
            },
        });
        return this.mapToDomain(record);
    }
    async update(member) {
        const record = await this.prisma.corporateMember.update({
            where: { id: member.id },
            data: {
                role: member.role,
                status: member.status,
                monthlyCapPaise: member.monthlyCapPaise,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.corporateMember.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.corporateMember.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByAccountAndUser(corporateAccountId, userId) {
        const record = await this.prisma.corporateMember.findUnique({
            where: { corporateAccountId_userId: { corporateAccountId, userId } },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async findByUserId(userId) {
        const record = await this.prisma.corporateMember.findFirst({
            where: { userId, status: 'ACTIVE' },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async listByAccountId(corporateAccountId) {
        const records = await this.prisma.corporateMember.findMany({
            where: { corporateAccountId },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async delete(id) {
        await this.prisma.corporateMember.delete({ where: { id } });
    }
}
//# sourceMappingURL=PrismaCorporateMemberRepository.js.map