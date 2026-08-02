import { AdminUserRole } from '../AdminUserRole.js';
export interface IAdminRoleRepository {
    assignRole(userId: number, roleId: number, assignedBy?: number): Promise<AdminUserRole>;
    removeRole(userId: number, roleId: number): Promise<boolean>;
    findRolesForUser(userId: number): Promise<number[]>;
}
