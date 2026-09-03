import { type IRepository } from '@carbroz/foundation-kernel';
import { type PartnerProfile } from '../PartnerProfile.js';

export interface IPartnerProfileRepository extends IRepository<PartnerProfile, number> {
  findByPublicId(publicId: string): Promise<PartnerProfile | null>;
  findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
  create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile>;
  update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile>;
}
