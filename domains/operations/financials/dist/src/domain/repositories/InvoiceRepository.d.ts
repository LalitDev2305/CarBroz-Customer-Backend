import { Invoice } from '../entities/Invoice.js';
export interface InvoiceRepository {
    findById(id: number): Promise<Invoice | null>;
    findByBookingId(bookingId: number): Promise<Invoice | null>;
    create(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
}
