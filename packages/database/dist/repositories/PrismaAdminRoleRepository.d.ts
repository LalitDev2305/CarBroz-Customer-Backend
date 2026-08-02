import { IAdminRoleRepository } from '@carbroz/common';
import { AdminUserRole } from '@carbroz/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaAdminRoleRepository implements IAdminRoleRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    assignRole(userId: number, roleId: number, assignedBy?: number): Promise<AdminUserRole>;
    removeRole(userId: number, roleId: number): Promise<boolean>;
    findRolesForUser(userId: number): Promise<number[]>;
    private mapToDomain;
}
