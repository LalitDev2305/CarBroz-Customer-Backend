import { PrismaProvider } from '@carbroz/platform-database';
import { Role } from '../../../domain/entities/Role.js';
export declare class PrismaRoleRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
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
