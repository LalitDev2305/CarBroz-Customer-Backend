import { PartnerProfile } from '../PartnerProfile.js';
import { IRepository } from '../IRepository.js';

export interface IPartnerProfileRepository extends IRepository<PartnerProfile, number> {
  findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
  create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile>;
  update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile>;
}
