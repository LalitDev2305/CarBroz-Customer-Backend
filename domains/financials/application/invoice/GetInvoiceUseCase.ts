import { type IInvoiceRepository } from '../../invoice/domain/repositories/IInvoiceRepository.js';
import { Invoice } from '../../invoice/domain/Invoice.js';

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
