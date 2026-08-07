import { PrismaRepositoryBase } from './PrismaRepositoryBase.js';
import { IConfigRepository, SystemConfig } from '@carbroz/foundation-kernel';
export declare class PrismaConfigRepository extends PrismaRepositoryBase<SystemConfig, number, any, any, any, any, any> implements IConfigRepository {
    constructor(prismaProvider: import('../providers/PrismaProvider.js').PrismaProvider);
    protected mapToDomain(model: any): SystemConfig;
    protected mapToModel(entity: SystemConfig): any;
    protected getId(entity: SystemConfig): number;
    protected buildFindUniqueArgs(id: number): any;
    protected buildCreateArgs(model: any): any;
    protected buildUpdateArgs(model: any): any;
    protected buildSoftDeleteArgs(id: number): any;
    protected buildExistsArgs(id: number): any;
    findByKey(key: string): Promise<SystemConfig | null>;
    findAllConfig(): Promise<SystemConfig[]>;
}
//# sourceMappingURL=PrismaConfigRepository.d.ts.map