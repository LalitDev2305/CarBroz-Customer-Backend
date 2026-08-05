import { PrismaClient } from '@prisma/client';
import { ICorporateInvoiceRepository, CorporateInvoice, CorporateInvoiceStatus } from '@carbroz/common';
export declare class PrismaCorporateInvoiceRepository implements ICorporateInvoiceRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(invoice: CorporateInvoice): Promise<CorporateInvoice>;
    update(invoice: CorporateInvoice): Promise<CorporateInvoice>;
    findById(id: number): Promise<CorporateInvoice | null>;
    findByPublicId(publicId: string): Promise<CorporateInvoice | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<CorporateInvoice | null>;
    listByAccountId(corporateAccountId: number, status?: CorporateInvoiceStatus, limit?: number, offset?: number): Promise<CorporateInvoice[]>;
}
