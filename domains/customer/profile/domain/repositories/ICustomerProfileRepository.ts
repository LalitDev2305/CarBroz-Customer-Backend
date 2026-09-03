import { type CustomerProfile } from '../CustomerProfile.js';

export interface ICustomerProfileRepository {
  findById(id: number): Promise<CustomerProfile | null>;
  findByUserId(userId: number): Promise<CustomerProfile | null>;
  findAll(): Promise<CustomerProfile[]>;
  save(entity: CustomerProfile): Promise<CustomerProfile>;
  delete(id: number): Promise<boolean>;
}
