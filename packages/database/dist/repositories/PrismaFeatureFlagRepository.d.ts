import { PrismaRepositoryBase } from './PrismaRepositoryBase.js';
import { IFeatureFlagRepository, FeatureFlag } from '@carbroz/common';
export declare class PrismaFeatureFlagRepository extends PrismaRepositoryBase<FeatureFlag, number, any, any, any, any, any> implements IFeatureFlagRepository {
    constructor(prismaProvider: import('../providers/PrismaProvider.js').PrismaProvider);
    protected mapToDomain(model: any): FeatureFlag;
    protected mapToModel(entity: FeatureFlag): any;
    protected getId(entity: FeatureFlag): number;
    protected buildFindUniqueArgs(id: number): any;
    protected buildCreateArgs(model: any): any;
    protected buildUpdateArgs(model: any): any;
    protected buildSoftDeleteArgs(id: number): any;
    protected buildExistsArgs(id: number): any;
    findByKey(key: string): Promise<FeatureFlag | null>;
    findAllFlags(): Promise<FeatureFlag[]>;
}
