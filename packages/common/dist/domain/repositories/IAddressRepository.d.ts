import { IRepository } from '../IRepository.js';
import { Address } from '../Address.js';
export interface IAddressRepository extends IRepository<Address, number> {
    findByUserId(userId: number): Promise<Address[]>;
    findDefaultByUserId(userId: number): Promise<Address | null>;
}
