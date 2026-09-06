import type { IRepository } from '@carbroz/foundation-kernel';
import type { Partner } from '../Partner.js';

/** IPartnerRepository is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IPartnerRepository extends IRepository<Partner, number> {
  findByPublicId(publicId: string): Promise<Partner | null>;
  setUnitOfWork(uow: any): void;
  create(data: Partial<Partner>): Promise<Partner>;
}
