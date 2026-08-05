import { Dispute } from '../Dispute.js';
import { DisputeStatus } from '../DisputeStatus.js';

export interface IDisputeRepository {
  create(dispute: Dispute): Promise<Dispute>;
  update(dispute: Dispute): Promise<Dispute>;
  findById(id: number): Promise<Dispute | null>;
  findByPublicId(publicId: string): Promise<Dispute | null>;
  findActiveByBookingId(bookingId: number): Promise<Dispute | null>;
  listByBookingId(bookingId: number): Promise<Dispute[]>;
  list(status?: DisputeStatus, limit?: number, offset?: number): Promise<Dispute[]>;
}
