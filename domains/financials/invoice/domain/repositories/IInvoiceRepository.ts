import { Invoice } from '../../../invoice/domain/Invoice.js';

export interface IInvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  findById(id: number): Promise<Invoice | null>;
  findByPublicId(publicId: string): Promise<Invoice | null>;
  findByBookingId(bookingId: number): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  generateNextInvoiceNumber(): Promise<string>;
}
