import type { IRepository } from '@carbroz/foundation-kernel';
import type { Partner } from '../Partner.js';

export interface IPartnerRepository extends IRepository<Partner, number> {
  findByPublicId(publicId: string): Promise<Partner | null>;
  setUnitOfWork(uow: any): void;
  create(data: Partial<Partner>): Promise<Partner>;
}
