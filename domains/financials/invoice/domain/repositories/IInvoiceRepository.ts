import type { Invoice } from '../Invoice.js';

/** IInvoiceRepository is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IInvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  findById(id: number): Promise<Invoice | null>;
  findByPublicId(publicId: string): Promise<Invoice | null>;
  findByBookingId(bookingId: number): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  generateNextInvoiceNumber(): Promise<string>;
}
