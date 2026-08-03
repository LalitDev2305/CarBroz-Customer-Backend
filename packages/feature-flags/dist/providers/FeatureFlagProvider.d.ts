import { IFeatureFlagProvider, IFeatureFlagRepository } from '@carbroz/common';
export declare class FeatureFlagProvider implements IFeatureFlagProvider {
    private repository;
    constructor(featureFlagRepository: IFeatureFlagRepository);
    isEnabled(key: string): Promise<boolean>;
    getAllFlags(): Promise<Record<string, boolean>>;
}
