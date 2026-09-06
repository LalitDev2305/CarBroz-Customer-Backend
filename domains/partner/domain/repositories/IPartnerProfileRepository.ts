import type { IRepository } from '@carbroz/foundation-kernel';
import type { PartnerProfile } from '../PartnerProfile.js';

/** IPartnerProfileRepository is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IPartnerProfileRepository extends IRepository<PartnerProfile, number> {
  findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
  create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile>;
  update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile>;
}
