import { CustomerProfile } from '../entities/CustomerProfile.js';

export interface CustomerProfileRepository {
  findByUserId(userId: number): Promise<CustomerProfile | null>;
  save(profile: CustomerProfile): Promise<CustomerProfile>;
}
