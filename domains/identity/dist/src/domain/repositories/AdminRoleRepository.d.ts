import { AdminUserRole } from '../entities/AdminUserRole.js';
export interface AdminRoleRepository {
    findByUserId(userId: number): Promise<AdminUserRole[]>;
    assign(role: Omit<AdminUserRole, 'id' | 'assignedAt'>): Promise<AdminUserRole>;
}
