import type { IFeatureFlagProvider } from './IFeatureFlagProvider.js';
import type { IFeatureFlagRepository } from '../domain/repositories/IFeatureFlagRepository.js';

export class FeatureFlagProvider implements IFeatureFlagProvider {
  constructor(private readonly repository: IFeatureFlagRepository) {}

  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.repository.findByKey(key);
    return flag?.enabled ?? false;
  }

  async getAllFlags(): Promise<Record<string, boolean>> {
    const flags = await this.repository.findAllFlags();
    return Object.fromEntries(flags.map((flag) => [flag.key, flag.enabled]));
  }
}
