import { IInvoiceRepository, Invoice } from '@carbroz/common';

export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(publicId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByPublicId(publicId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }
}
