import { IRepository } from '../IRepository.js';
import { CustomerProfile } from '../CustomerProfile.js';

export interface ICustomerProfileRepository extends IRepository<CustomerProfile, number> {
  findByUserId(userId: number): Promise<CustomerProfile | null>;
}
