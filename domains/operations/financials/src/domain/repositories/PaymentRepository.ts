import { Payment } from '../entities/Payment.js';

export interface PaymentRepository {
  findById(id: number): Promise<Payment | null>;
  findByBookingId(bookingId: number): Promise<Payment | null>;
  create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
}
