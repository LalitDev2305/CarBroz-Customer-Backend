import { CorporateInvoice, CorporateInvoiceStatus } from '../CorporateInvoice.js';

/** ICorporateInvoiceRepository is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ICorporateInvoiceRepository {
  create(invoice: CorporateInvoice): Promise<CorporateInvoice>;
  update(invoice: CorporateInvoice): Promise<CorporateInvoice>;
  findById(id: number): Promise<CorporateInvoice | null>;
  findByPublicId(publicId: string): Promise<CorporateInvoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<CorporateInvoice | null>;
  listByAccountId(corporateAccountId: number, status?: CorporateInvoiceStatus, limit?: number, offset?: number): Promise<CorporateInvoice[]>;
}
