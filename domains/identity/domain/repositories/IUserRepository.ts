import type { IReadRepository, IWriteRepository } from '@carbroz/foundation-kernel';
import type { User } from '../User.js';

/** IUserRepository is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IUserRepository extends IReadRepository<User, number>, IWriteRepository<User, number> {
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  upsert(phoneNumber: string, data: Partial<User>): Promise<User>;
}
