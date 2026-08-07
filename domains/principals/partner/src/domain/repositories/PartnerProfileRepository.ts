import { PartnerProfile } from '../entities/PartnerProfile.js';

export interface PartnerProfileRepository {
  findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
  save(profile: PartnerProfile): Promise<PartnerProfile>;
}
