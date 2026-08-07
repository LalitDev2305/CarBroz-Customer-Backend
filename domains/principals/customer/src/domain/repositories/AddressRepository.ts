import { Address } from '../entities/Address.js';

export interface AddressRepository {
  findById(id: number): Promise<Address | null>;
  findByUserId(userId: number): Promise<Address[]>;
  create(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address>;
}
