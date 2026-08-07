import { CorporateInvoice } from '@carbroz/foundation-kernel';
export class PrismaCorporateInvoiceRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new CorporateInvoice({
            id: record.id,
            publicId: record.publicId,
            invoiceNumber: record.invoiceNumber,
            corporateAccountId: record.corporateAccountId,
            billingPeriodStart: record.billingPeriodStart,
            billingPeriodEnd: record.billingPeriodEnd,
            subtotalPaise: record.subtotalPaise,
            cgstPaise: record.cgstPaise,
            sgstPaise: record.sgstPaise,
            igstPaise: record.igstPaise,
            totalAmountPaise: record.totalAmountPaise,
            paidAmountPaise: record.paidAmountPaise,
            dueDate: record.dueDate,
            status: record.status,
            lines: (record.lines ?? []).map((l) => ({
                id: l.id,
                publicId: l.publicId,
                corporateInvoiceId: l.corporateInvoiceId,
                bookingId: l.bookingId,
                description: l.description,
                amountPaise: l.amountPaise,
                taxRateBasis: Number(l.taxRateBasis),
                createdAt: l.createdAt,
            })),
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(invoice) {
        const record = await this.prisma.corporateInvoice.create({
            data: {
                invoiceNumber: invoice.invoiceNumber,
                corporateAccountId: invoice.corporateAccountId,
                billingPeriodStart: invoice.billingPeriodStart,
                billingPeriodEnd: invoice.billingPeriodEnd,
                subtotalPaise: invoice.subtotalPaise,
                cgstPaise: invoice.cgstPaise,
                sgstPaise: invoice.sgstPaise,
                igstPaise: invoice.igstPaise,
                totalAmountPaise: invoice.totalAmountPaise,
                paidAmountPaise: invoice.paidAmountPaise,
                dueDate: invoice.dueDate,
                status: invoice.status,
                lines: {
                    create: invoice.lines.map((l) => ({
                        bookingId: l.bookingId,
                        description: l.description,
                        amountPaise: l.amountPaise,
                        taxRateBasis: l.taxRateBasis,
                    })),
                },
            },
            include: { lines: true },
        });
        return this.mapToDomain(record);
    }
    async update(invoice) {
        const record = await this.prisma.corporateInvoice.update({
            where: { id: invoice.id },
            data: {
                paidAmountPaise: invoice.paidAmountPaise,
                status: invoice.status,
            },
            include: { lines: true },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.corporateInvoice.findUnique({
            where: { id },
            include: { lines: true },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.corporateInvoice.findUnique({
            where: { publicId },
            include: { lines: true },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async findByInvoiceNumber(invoiceNumber) {
        const record = await this.prisma.corporateInvoice.findUnique({
            where: { invoiceNumber },
            include: { lines: true },
        });
        return record ? this.mapToDomain(record) : null;
    }
    async listByAccountId(corporateAccountId, status, limit = 50, offset = 0) {
        const records = await this.prisma.corporateInvoice.findMany({
            where: {
                corporateAccountId,
                status: status ? status : undefined,
            },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include: { lines: true },
        });
        return records.map((r) => this.mapToDomain(r));
    }
}
//# sourceMappingURL=PrismaCorporateInvoiceRepository.js.map