import { IFeatureFlagProvider, IFeatureFlagRepository } from '@carbroz/foundation-kernel';
export declare class FeatureFlagProvider implements IFeatureFlagProvider {
    private repository;
    constructor(featureFlagRepository: IFeatureFlagRepository);
    isEnabled(key: string): Promise<boolean>;
    getAllFlags(): Promise<Record<string, boolean>>;
}
