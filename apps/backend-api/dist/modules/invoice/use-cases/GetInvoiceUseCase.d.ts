import { IInvoiceRepository, Invoice } from '@carbroz/common';
export declare class GetInvoiceUseCase {
    private readonly invoiceRepository;
    constructor(invoiceRepository: IInvoiceRepository);
    execute(publicId: string): Promise<Invoice>;
}
