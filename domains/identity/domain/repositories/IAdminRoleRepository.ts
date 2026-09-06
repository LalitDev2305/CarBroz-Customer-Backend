import type { AdminUserRole } from '../AdminUserRole.js';

/** IAdminRoleRepository is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IAdminRoleRepository {
  assignRole(userId: number, roleId: number, assignedBy?: number): Promise<AdminUserRole>;
  removeRole(userId: number, roleId: number): Promise<boolean>;
  findRolesForUser(userId: number): Promise<number[]>;
}
