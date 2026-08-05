import { PrismaClient } from '@prisma/client';
import { IConfigRepository, SystemConfig } from '@carbroz/common';
export declare class PrismaConfigRepository implements IConfigRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
    private get prisma();
    private mapToDomain;
    findById(id: number): Promise<SystemConfig | null>;
    findAll(): Promise<SystemConfig[]>;
    save(entity: SystemConfig): Promise<SystemConfig>;
    delete(id: number): Promise<boolean>;
    findByKey(key: string): Promise<SystemConfig | null>;
    findAllConfig(): Promise<SystemConfig[]>;
}
//# sourceMappingURL=PrismaConfigRepository.d.ts.map