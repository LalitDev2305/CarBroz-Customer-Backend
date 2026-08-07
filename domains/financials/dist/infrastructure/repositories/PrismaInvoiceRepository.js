import { Invoice } from '../../domain/Invoice.js';
export class PrismaInvoiceRepository {
    prismaProvider;
    unitOfWorkPrisma = null;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaProvider.getClient();
    }
    mapToDomain(record) {
        return new Invoice({
            id: record.id,
            publicId: record.publicId,
            bookingId: record.bookingId,
            invoiceNumber: record.invoiceNumber,
            status: record.status,
            amountPaise: record.amountPaise,
            currency: record.currency,
            documentJson: record.documentJson,
            issuedAt: record.issuedAt,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
    async create(invoice) {
        const record = await this.prisma.invoice.create({
            data: {
                bookingId: invoice.bookingId,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                amountPaise: invoice.amountPaise,
                currency: invoice.currency,
                documentJson: invoice.documentJson,
                issuedAt: invoice.issuedAt,
            },
        });
        return this.mapToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.invoice.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.invoice.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByBookingId(bookingId) {
        const record = await this.prisma.invoice.findUnique({ where: { bookingId } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByInvoiceNumber(invoiceNumber) {
        const record = await this.prisma.invoice.findUnique({ where: { invoiceNumber } });
        return record ? this.mapToDomain(record) : null;
    }
    async generateNextInvoiceNumber() {
        const year = new Date().getFullYear();
        const sequenceRecord = await this.prisma.invoiceSequence.upsert({
            where: { year },
            update: { lastSeq: { increment: 1 } },
            create: { year, lastSeq: 1 },
        });
        const seq = sequenceRecord.lastSeq.toString().padStart(6, '0');
        return `INV-${year}-${seq}`;
    }
}
//# sourceMappingURL=PrismaInvoiceRepository.js.map