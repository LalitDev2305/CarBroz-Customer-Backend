import { CorporateCreditLedger } from '@carbroz/foundation-kernel';
export class PrismaCorporateCreditLedgerRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new CorporateCreditLedger({
            id: record.id,
            publicId: record.publicId,
            corporateAccountId: record.corporateAccountId,
            bookingId: record.bookingId,
            invoiceId: record.invoiceId,
            entryType: record.entryType,
            amountPaise: record.amountPaise,
            balanceAfterPaise: record.balanceAfterPaise,
            referenceNotes: record.referenceNotes,
            createdAt: record.createdAt,
        });
    }
    async create(entry) {
        const record = await this.prisma.corporateCreditLedger.create({
            data: {
                corporateAccountId: entry.corporateAccountId,
                bookingId: entry.bookingId,
                invoiceId: entry.invoiceId,
                entryType: entry.entryType,
                amountPaise: entry.amountPaise,
                balanceAfterPaise: entry.balanceAfterPaise,
                referenceNotes: entry.referenceNotes,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.corporateCreditLedger.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.corporateCreditLedger.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async listByAccountId(corporateAccountId, limit = 50, offset = 0) {
        const records = await this.prisma.corporateCreditLedger.findMany({
            where: { corporateAccountId },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async getLatestEntry(corporateAccountId) {
        const record = await this.prisma.corporateCreditLedger.findFirst({
            where: { corporateAccountId },
            orderBy: { createdAt: 'desc' },
        });
        return record ? this.mapToDomain(record) : null;
    }
}
//# sourceMappingURL=PrismaCorporateCreditLedgerRepository.js.map