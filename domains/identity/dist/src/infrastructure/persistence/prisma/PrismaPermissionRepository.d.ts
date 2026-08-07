import { PrismaProvider } from '@carbroz/platform-database';
import { Permission } from '../../../domain/entities/Permission.js';
export declare class PrismaPermissionRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    findById(id: number): Promise<Permission | null>;
    findAll(): Promise<Permission[]>;
    findByKey(key: string): Promise<Permission | null>;
    save(entity: Permission): Promise<Permission>;
    delete(id: number): Promise<boolean>;
    private mapToDomain;
}
