import { IFeatureFlagProvider, IFeatureFlagRepository } from '@carbroz/foundation-kernel';


export class FeatureFlagProvider implements IFeatureFlagProvider {
  private repository: IFeatureFlagRepository;

  constructor(featureFlagRepository: IFeatureFlagRepository) {
    this.repository = featureFlagRepository;
  }

  public async isEnabled(key: string): Promise<boolean> {
    const flag = await this.repository.findByKey(key);
    return flag ? flag.enabled : false;
  }

  public async getAllFlags(): Promise<Record<string, boolean>> {
    const flags = await this.repository.findAllFlags();
    const result: Record<string, boolean> = {};
    for (const flag of flags) {
      result[flag.key] = flag.enabled;
    }
    return result;
  }
}
