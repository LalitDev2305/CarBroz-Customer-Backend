import { PrismaProvider } from '@carbroz/platform-database';
import { Invoice } from '../../domain/Invoice.js';
export declare class PrismaInvoiceRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(invoice: Invoice): Promise<Invoice>;
    findById(id: number): Promise<Invoice | null>;
    findByPublicId(publicId: string): Promise<Invoice | null>;
    findByBookingId(bookingId: number): Promise<Invoice | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
    generateNextInvoiceNumber(): Promise<string>;
}
//# sourceMappingURL=PrismaInvoiceRepository.d.ts.map