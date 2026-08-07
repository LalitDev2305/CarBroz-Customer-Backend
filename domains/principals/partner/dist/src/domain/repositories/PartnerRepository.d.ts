import { Partner } from '../entities/Partner.js';
export interface PartnerRepository {
    findById(id: number): Promise<Partner | null>;
    save(partner: Partner): Promise<Partner>;
}
