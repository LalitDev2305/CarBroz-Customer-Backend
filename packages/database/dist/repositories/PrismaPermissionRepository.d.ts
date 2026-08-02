import { IPermissionRepository } from '@carbroz/common';
import { Permission } from '@carbroz/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaPermissionRepository implements IPermissionRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: number): Promise<Permission | null>;
    findAll(): Promise<Permission[]>;
    findByKey(key: string): Promise<Permission | null>;
    save(entity: Permission): Promise<Permission>;
    delete(id: number): Promise<boolean>;
    private mapToDomain;
}
