import { type IRepository } from '@carbroz/foundation-kernel';
import { type Partner } from '../Partner.js';

export interface IPartnerRepository extends IRepository<Partner, number> {
  findByPublicId(publicId: string): Promise<Partner | null>;
  create(data: Partial<Partner>): Promise<Partner>;
  setUnitOfWork(uow: unknown): void;
}
