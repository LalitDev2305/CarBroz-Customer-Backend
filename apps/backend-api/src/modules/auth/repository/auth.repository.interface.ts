import { UserIdentity } from '../domain/user-identity.entity.js';

export interface IAuthRepository {
  findById(id: string): Promise<UserIdentity | null>;
  findByMobileNumber(mobileNumber: string): Promise<UserIdentity | null>;
  create(userIdentity: Partial<UserIdentity>): Promise<UserIdentity>;
  update(id: string, updateData: Partial<UserIdentity>): Promise<UserIdentity>;
}
