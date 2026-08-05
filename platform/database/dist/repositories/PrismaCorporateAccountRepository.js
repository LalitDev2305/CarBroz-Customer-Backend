import { CorporateAccount } from '@carbroz/common';
export class PrismaCorporateAccountRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new CorporateAccount({
            id: record.id,
            publicId: record.publicId,
            companyName: record.companyName,
            legalName: record.legalName,
            gstin: record.gstin,
            pan: record.pan,
            billingAddress: record.billingAddress,
            creditLimitPaise: record.creditLimitPaise,
            utilisedCreditPaise: record.utilisedCreditPaise,
            status: record.status,
            paymentTermsDays: record.paymentTermsDays,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(account) {
        const record = await this.prisma.corporateAccount.create({
            data: {
                companyName: account.companyName,
                legalName: account.legalName,
                gstin: account.gstin,
                pan: account.pan,
                billingAddress: account.billingAddress,
                creditLimitPaise: account.creditLimitPaise,
                utilisedCreditPaise: account.utilisedCreditPaise,
                status: account.status,
                paymentTermsDays: account.paymentTermsDays,
            },
        });
        return this.mapToDomain(record);
    }
    async update(account) {
        const record = await this.prisma.corporateAccount.update({
            where: { id: account.id },
            data: {
                companyName: account.companyName,
                legalName: account.legalName,
                gstin: account.gstin,
                pan: account.pan,
                billingAddress: account.billingAddress,
                creditLimitPaise: account.creditLimitPaise,
                utilisedCreditPaise: account.utilisedCreditPaise,
                status: account.status,
                paymentTermsDays: account.paymentTermsDays,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.corporateAccount.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.corporateAccount.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByGstin(gstin) {
        const record = await this.prisma.corporateAccount.findUnique({
            where: { gstin: gstin.trim().toUpperCase() },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async listByStatus(status, limit = 50, offset = 0) {
        const records = await this.prisma.corporateAccount.findMany({
            where: status ? { status } : undefined,
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async updateUtilisedCredit(id, deltaPaise) {
        const record = await this.prisma.corporateAccount.update({
            where: { id },
            data: {
                utilisedCreditPaise: { increment: deltaPaise },
            },
        });
        return this.mapToDomain(record);
    }
}
//# sourceMappingURL=PrismaCorporateAccountRepository.js.map