import { IInvoiceRepository, Invoice } from '@carbroz/foundation-kernel';
export declare class GetInvoiceUseCase {
    private readonly invoiceRepository;
    constructor(invoiceRepository: IInvoiceRepository);
    execute(publicId: string): Promise<Invoice>;
}
