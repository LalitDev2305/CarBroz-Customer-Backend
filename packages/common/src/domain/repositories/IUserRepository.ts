import { User } from '../User.js';
import { IReadRepository } from '../IReadRepository.js';
import { IWriteRepository } from '../IWriteRepository.js';

export interface IUserRepository extends IReadRepository<User, number>, IWriteRepository<User, number> {
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  upsert(phoneNumber: string, data: Partial<User>): Promise<User>;
}
