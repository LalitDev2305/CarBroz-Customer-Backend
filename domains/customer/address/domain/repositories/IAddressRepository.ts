import type { Address } from '../Address.js';

/** IAddressRepository is an exported domains/customer contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IAddressRepository {
  findById(id: number): Promise<Address | null>;
  findByUserId(userId: number): Promise<Address[]>;
  findDefaultByUserId(userId: number): Promise<Address | null>;
  findAll(): Promise<Address[]>;
  save(entity: Address): Promise<Address>;
  delete(id: number): Promise<boolean>;
}
