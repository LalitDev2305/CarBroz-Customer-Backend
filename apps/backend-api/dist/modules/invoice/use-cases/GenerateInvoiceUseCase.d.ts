import { IBookingRepository, IInvoiceRepository, Invoice, TaxCalculator } from '@carbroz/common';
export declare class GenerateInvoiceUseCase {
    private readonly invoiceRepository;
    private readonly bookingRepository;
    private readonly taxCalculator;
    constructor(invoiceRepository: IInvoiceRepository, bookingRepository: IBookingRepository, taxCalculator?: TaxCalculator);
    execute(bookingId: number): Promise<Invoice>;
}
