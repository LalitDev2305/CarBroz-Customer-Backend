import { Dispute } from '../entities/Dispute.js';
export interface DisputeRepository {
    findById(id: number): Promise<Dispute | null>;
    listByBookingId(bookingId: number): Promise<Dispute[]>;
    create(dispute: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dispute>;
}
