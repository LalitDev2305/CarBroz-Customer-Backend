import { Dispute } from '../entities/Dispute.js';
import { DisputeStatus } from '../enums/DisputeStatus.js';

export interface DisputeRepository {
  findById(id: number): Promise<Dispute | null>;
  listByBookingId(bookingId: number): Promise<Dispute[]>;
  create(dispute: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dispute>;
}
