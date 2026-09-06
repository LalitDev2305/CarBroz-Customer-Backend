import type { CustomerProfile } from '../CustomerProfile.js';

/** ICustomerProfileRepository is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ICustomerProfileRepository {
  findById(id: number): Promise<CustomerProfile | null>;
  findByUserId(userId: number): Promise<CustomerProfile | null>;
  findAll(): Promise<CustomerProfile[]>;
  save(entity: CustomerProfile): Promise<CustomerProfile>;
  delete(id: number): Promise<boolean>;
}
