import { PrismaClient } from '@prisma/client';
import { IInvoiceRepository, Invoice } from '@carbroz/common';
export declare class PrismaInvoiceRepository implements IInvoiceRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(invoice: Invoice): Promise<Invoice>;
    findById(id: number): Promise<Invoice | null>;
    findByPublicId(publicId: string): Promise<Invoice | null>;
    findByBookingId(bookingId: number): Promise<Invoice | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
    generateNextInvoiceNumber(): Promise<string>;
}
