import { PartnerPayout } from '../entities/PartnerPayout.js';
export interface PartnerPayoutRepository {
    findById(id: number): Promise<PartnerPayout | null>;
    listByPartnerId(partnerId: number): Promise<PartnerPayout[]>;
    create(payout: Omit<PartnerPayout, 'id' | 'createdAt' | 'updatedAt'>): Promise<PartnerPayout>;
}
