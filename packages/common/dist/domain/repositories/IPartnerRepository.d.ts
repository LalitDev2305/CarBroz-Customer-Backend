import { Partner } from '../Partner.js';
import { IRepository } from '../IRepository.js';
export interface IPartnerRepository extends IRepository<Partner, number> {
    findByPublicId(publicId: string): Promise<Partner | null>;
    setUnitOfWork(uow: any): void;
    create(data: Partial<Partner>): Promise<Partner>;
}
