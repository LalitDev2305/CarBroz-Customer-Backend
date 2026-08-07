import { IRoleRepository } from '@carbroz/foundation-kernel';
import { Role } from '@carbroz/foundation-kernel';
import { PrismaClient } from '@prisma/client';
export declare class PrismaRoleRepository implements IRoleRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: number): Promise<Role | null>;
    findAll(): Promise<Role[]>;
    findByName(name: string): Promise<Role | null>;
    findWithPermissions(roleId: number): Promise<Role & {
        permissions: number[];
    } | null>;
    save(entity: Role): Promise<Role>;
    delete(id: number): Promise<boolean>;
    private mapToDomain;
}
//# sourceMappingURL=PrismaRoleRepository.d.ts.map