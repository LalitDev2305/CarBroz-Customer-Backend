import { IRepository } from '../IRepository.js';
import { FeatureFlag } from '../FeatureFlag.js';

export interface IFeatureFlagRepository extends IRepository<FeatureFlag, number> {
  findByKey(key: string): Promise<FeatureFlag | null>;
  findAllFlags(): Promise<FeatureFlag[]>;
}
