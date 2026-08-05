import { PartnerPayout } from '../PartnerPayout.js';
import { PayoutStatus } from '../PayoutStatus.js';

export interface IPartnerPayoutRepository {
  create(payout: PartnerPayout): Promise<PartnerPayout>;
  findById(id: number): Promise<PartnerPayout | null>;
  findByPublicId(publicId: string): Promise<PartnerPayout | null>;
  findByBookingId(bookingId: number): Promise<PartnerPayout | null>;
  listByPartnerId(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]>;
  listByStatus(status: PayoutStatus, limit?: number, offset?: number): Promise<PartnerPayout[]>;
  update(payout: PartnerPayout): Promise<PartnerPayout>;
}
