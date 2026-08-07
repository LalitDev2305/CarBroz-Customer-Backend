import { PrismaProvider } from '@carbroz/platform-database';
import { AdminUserRole } from '../../domain/AdminUserRole.js';
export declare class PrismaAdminRoleRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    assignRole(userId: number, roleId: number, assignedBy?: number): Promise<AdminUserRole>;
    removeRole(userId: number, roleId: number): Promise<boolean>;
    findRolesForUser(userId: number): Promise<number[]>;
    private mapToDomain;
}
//# sourceMappingURL=PrismaAdminRoleRepository.d.ts.map