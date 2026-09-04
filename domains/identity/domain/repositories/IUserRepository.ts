import type { IReadRepository, IWriteRepository } from '@carbroz/foundation-kernel';
import type { User } from '../User.js';

export interface IUserRepository extends IReadRepository<User, number>, IWriteRepository<User, number> {
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  upsert(phoneNumber: string, data: Partial<User>): Promise<User>;
}
