import { IBookingRepository, IInvoiceRepository, Invoice } from '@carbroz/foundation-kernel';
export declare class GenerateInvoiceUseCase {
    private readonly invoiceRepository;
    private readonly bookingRepository;
    private readonly taxCalculator;
    constructor(invoiceRepository: IInvoiceRepository, bookingRepository: IBookingRepository, taxCalculator?: any);
    execute(bookingId: number): Promise<Invoice>;
}
