import type { IRepository } from '@carbroz/foundation-kernel';
import type { PartnerMember } from '../PartnerMember.js';

export interface IPartnerMemberRepository extends IRepository<PartnerMember, number> {
  findByPublicId(publicId: string): Promise<PartnerMember | null>;
  findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null>;
  findByUserId(userId: number): Promise<PartnerMember[]>;
  findByPartnerId(partnerId: number): Promise<PartnerMember[]>;
  setUnitOfWork(uow: any): void;
  create(data: Partial<PartnerMember>): Promise<PartnerMember>;
}
