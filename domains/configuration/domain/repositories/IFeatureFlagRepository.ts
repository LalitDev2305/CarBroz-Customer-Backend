import type { IRepository } from '@carbroz/foundation-kernel';
import type { FeatureFlag } from '../FeatureFlag.js';

/** IFeatureFlagRepository is an exported domains/configuration contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IFeatureFlagRepository extends IRepository<FeatureFlag, number> {
  findByKey(key: string): Promise<FeatureFlag | null>;
  findAllFlags(): Promise<FeatureFlag[]>;
}
